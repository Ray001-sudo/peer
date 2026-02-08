import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

const statusConfig = {
  pending: { icon: AlertCircle, color: "bg-warning/10 text-warning", label: "Pending" },
  funded_escrow: { icon: Clock, color: "bg-primary/10 text-primary", label: "In Progress" },
  completed: { icon: CheckCircle, color: "bg-success/10 text-success", label: "Completed" },
  cancelled: { icon: XCircle, color: "bg-destructive/10 text-destructive", label: "Cancelled" },
};

export default function Bookings() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  const isCompanion = profile?.role === "companion";

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", user?.id, activeTab],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from("bookings")
        .select("*")
        .or(`client_id.eq.${user.id},companion_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (activeTab !== "all") {
        query = query.eq("status", activeTab as "pending" | "funded_escrow" | "completed" | "cancelled");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "funded_escrow" | "completed" | "cancelled" }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update booking");
    },
  });

  const handleConfirmComplete = (bookingId: string) => {
    updateBooking.mutate({ id: bookingId, status: "completed" });
  };

  const handleCancelBooking = (bookingId: string) => {
    updateBooking.mutate({ id: bookingId, status: "cancelled" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">
            {isCompanion
              ? "Manage bookings from your clients"
              : "Track your companion bookings"}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="funded_escrow">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking, index) => {
                  const status = statusConfig[booking.status as keyof typeof statusConfig];
                  const StatusIcon = status?.icon || AlertCircle;
                  const isClient = booking.client_id === user?.id;

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {booking.booking_type.charAt(0).toUpperCase() +
                                    booking.booking_type.slice(1)}{" "}
                                  Booking
                                </h3>
                                <Badge className={status?.color}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status?.label}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>
                                  Duration: {booking.duration}{" "}
                                  {booking.booking_type === "hourly"
                                    ? "hour(s)"
                                    : booking.booking_type === "daily"
                                    ? "day(s)"
                                    : "week(s)"}
                                </p>
                                <p>
                                  Created: {format(new Date(booking.created_at), "PPp")}
                                </p>
                                {booking.notes && (
                                  <p className="mt-2 p-2 bg-muted rounded text-sm">
                                    {booking.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <p className="text-2xl font-bold text-primary">
                              KES {booking.total_amount.toLocaleString()}
                            </p>

                            {/* Client actions for funded_escrow bookings */}
                            {isClient && booking.status === "funded_escrow" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="success" size="sm">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Confirm Completed
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Service Completion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will release 80% of the payment to the companion and 
                                      20% to the platform. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleConfirmComplete(booking.id)}
                                    >
                                      Confirm & Release Funds
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {/* Cancel option for pending bookings */}
                            {booking.status === "pending" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel this booking? 
                                      {isClient
                                        ? " You will receive a full refund."
                                        : " The client will be notified."}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleCancelBooking(booking.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Cancel Booking
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all"
                    ? "You don't have any bookings yet."
                    : `No ${activeTab.replace("_", " ")} bookings.`}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
