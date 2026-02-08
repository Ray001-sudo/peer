import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, TrendingUp, ArrowRight, Users, DollarSign, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const queryClient = useQueryClient();

  // 1. Fetch IDs of activities the user has hidden in the database
  const { data: hiddenIds = [] } = useQuery({
    queryKey: ["hidden-activities", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("hidden_activities")
        .select("booking_id")
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map((item) => item.booking_id);
    },
    enabled: !!user?.id,
  });

  // 2. Fetch recent bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .or(`client_id.eq.${user.id},companion_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(10); // Fetch a few more so we have some left if some are hidden

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // 3. Logic to hide activities in the database
  const hideActivitiesMutation = useMutation({
    mutationFn: async () => {
      if (!bookings || !user?.id) return;

      // Only hide bookings that aren't already hidden
      const currentVisibleIds = bookings
        .filter((b) => !hiddenIds.includes(b.id))
        .map((b) => ({
          user_id: user.id,
          booking_id: b.id,
        }));

      if (currentVisibleIds.length === 0) return;

      const { error } = await supabase
        .from("hidden_activities")
        .insert(currentVisibleIds);

      if (error) throw error;
    },
    onSuccess: () => {
      // Refresh the hidden list so the UI updates
      queryClient.invalidateQueries({ queryKey: ["hidden-activities", user?.id] });
      toast.success("Recent activity cleared");
    },
    onError: () => {
      toast.error("Failed to clear activity");
    }
  });

  // Filter out the hidden bookings for the UI
  const visibleBookings = bookings?.filter((b) => !hiddenIds.includes(b.id)) || [];

  const isCompanion = profile?.role === "companion";

  const stats = isCompanion
    ? [
        { title: "Total Earnings", value: "KES 0", icon: DollarSign, change: "+0%" },
        { 
          title: "Active Bookings", 
          value: bookings?.filter((b) => b.status === "funded_escrow").length || 0, 
          icon: Calendar, 
          change: "Live" 
        },
        { title: "Profile Views", value: "0", icon: Users, change: "This week" },
      ]
    : [
        { title: "Total Bookings", value: bookings?.length || 0, icon: Calendar, change: "All time" },
        { 
          title: "Active Now", 
          value: bookings?.filter((b) => b.status === "funded_escrow").length || 0, 
          icon: TrendingUp, 
          change: "In progress" 
        },
      ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-primary p-6 md:p-8"
        >
          <div className="max-w-2xl">
            {profileLoading ? (
              <>
                <Skeleton className="h-8 w-48 mb-2 bg-primary-foreground/20" />
                <Skeleton className="h-5 w-64 bg-primary-foreground/20" />
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                  Welcome back, {profile?.full_name?.split(" ")[0] || "there"}!
                </h1>
                <p className="text-primary-foreground/80">
                  {isCompanion
                    ? "Manage your bookings and grow your companion profile."
                    : "Find and book verified companions for your next event."}
                </p>
              </>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" asChild>
                <Link to={isCompanion ? "/profile" : "/explore"}>
                  {isCompanion ? "Edit Profile" : "Explore Companions"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/bookings">View Bookings</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <div className="flex gap-2">
              {visibleBookings.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => hideActivitiesMutation.mutate()}
                  disabled={hideActivitiesMutation.isPending}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {hideActivitiesMutation.isPending ? "Clearing..." : "Clear"}
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/bookings">View all</Link>
              </Button>
            </div>
          </div>

          {bookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : visibleBookings.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {booking.booking_type.charAt(0).toUpperCase() +
                              booking.booking_type.slice(1)}{" "}
                            Booking
                          </p>
                          <p className="text-sm text-muted-foreground">
                            KES {booking.total_amount.toLocaleString()} • {booking.duration}{" "}
                            {booking.booking_type === "hourly"
                              ? "hour(s)"
                              : booking.booking_type === "daily"
                              ? "day(s)"
                              : "week(s)"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                              booking.status === "completed"
                                ? "bg-success/10 text-success"
                                : booking.status === "funded_escrow"
                                ? "bg-primary/10 text-primary"
                                : booking.status === "cancelled"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {booking.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="p-8 text-center border-dashed">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium mb-1">No recent activity</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your recent history is cleared. New bookings will appear here.
              </p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}