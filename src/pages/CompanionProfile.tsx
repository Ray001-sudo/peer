import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Shield,
  Star,
  MessageCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCompanionById } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BOOKING_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

export default function CompanionProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { data: companion, isLoading } = useCompanionById(id);
  
  const [bookingType, setBookingType] = useState<string>("hourly");
  const [duration, setDuration] = useState(1);
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const getRate = () => {
    if (!companion) return 0;
    switch (bookingType) {
      case "hourly":
        return Number(companion.rate_hourly) || 0;
      case "daily":
        return Number(companion.rate_daily) || 0;
      case "weekly":
        return Number(companion.rate_weekly) || 0;
      default:
        return 0;
    }
  };

  const totalAmount = getRate() * duration;

  const handleBooking = async () => {
    if (!user?.id || !companion?.id) {
      toast.error("Please log in to book");
      return;
    }

    if (!profile?.phone_number) {
      toast.error("Please add your phone number in your profile first");
      return;
    }

    setIsBooking(true);
    try {
      // Create booking
      const { data: booking, error } = await supabase.from("bookings").insert({
        client_id: user.id,
        companion_id: companion.id,
        booking_type: bookingType,
        duration,
        total_amount: totalAmount,
        notes,
        status: "pending",
      }).select().single();

      if (error) throw error;

      // Send email notification for booking created
      try {
        await supabase.functions.invoke("send-booking-email", {
          body: { booking_id: booking.id, type: "booking_created" },
        });
      } catch (emailError) {
        console.error("Email notification failed:", emailError);
      }

      // Trigger M-Pesa STK Push
      const { data: mpesaResult, error: mpesaError } = await supabase.functions.invoke("mpesa-stk-push", {
        body: {
          phone_number: profile.phone_number,
          amount: totalAmount,
          booking_id: booking.id,
          account_reference: `PeerPair-${booking.id.slice(0, 8)}`,
        },
      });

      if (mpesaError) {
        toast.error("M-Pesa request failed. Please try again.");
        console.error("M-Pesa error:", mpesaError);
      } else if (mpesaResult?.success) {
        toast.success("Check your phone for M-Pesa prompt!");
        setDialogOpen(false);
        navigate("/bookings");
      } else {
        toast.error(mpesaResult?.error || "M-Pesa request failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create booking");
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[4/5] rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!companion) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Companion not found</h2>
          <p className="text-muted-foreground mb-4">
            This profile may have been removed or doesn't exist.
          </p>
          <Button onClick={() => navigate("/explore")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-[4/5] rounded-2xl bg-muted overflow-hidden"
          >
            {companion.avatar_url ? (
              <img
                src={companion.avatar_url}
                alt={companion.full_name || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="gap-1">
                  <Shield className="w-3 h-3" />
                  Verified
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {companion.full_name || "Anonymous"}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {companion.location || "Kenya"}
              </p>
            </div>

            {/* Attributes */}
            <div className="flex flex-wrap gap-2">
              {companion.age && (
                <Badge variant="outline">{companion.age} years old</Badge>
              )}
              {companion.height && (
                <Badge variant="outline">{companion.height}</Badge>
              )}
              {companion.complexion && (
                <Badge variant="outline">{companion.complexion} complexion</Badge>
              )}
            </div>

            {/* Bio */}
            {companion.bio && (
              <div>
                <h3 className="font-medium mb-2">About</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {companion.bio}
                </p>
              </div>
            )}

            {/* Rates */}
            <div className="rounded-xl border border-border p-4 space-y-3">
              <h3 className="font-medium">Rates (KES)</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted">
                  <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-semibold">
                    {companion.rate_hourly?.toLocaleString() || "---"}
                  </p>
                  <p className="text-xs text-muted-foreground">per hour</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-semibold">
                    {companion.rate_daily?.toLocaleString() || "---"}
                  </p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-semibold">
                    {companion.rate_weekly?.toLocaleString() || "---"}
                  </p>
                  <p className="text-xs text-muted-foreground">per week</p>
                </div>
              </div>
            </div>

            {/* Booking Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="hero" className="w-full">
                  Book via M-Pesa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Book {companion.full_name}</DialogTitle>
                  <DialogDescription>
                    Configure your booking and pay securely via M-Pesa
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Booking Type</Label>
                      <Select value={bookingType} onValueChange={setBookingType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BOOKING_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        type="number"
                        min={1}
                        max={bookingType === "weekly" ? 4 : bookingType === "daily" ? 7 : 24}
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea
                      placeholder="Any special requirements or meeting details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <div className="rounded-lg bg-accent p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="text-2xl font-bold text-primary">
                        KES {totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Payment held in escrow until service is completed
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleBooking}
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      "Pay with M-Pesa"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
