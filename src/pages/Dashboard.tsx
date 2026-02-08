import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Calendar, TrendingUp, ArrowRight, Users, DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .or(`client_id.eq.${user.id},companion_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const isCompanion = profile?.role === "companion";

  const stats = isCompanion
    ? [
        {
          title: "Total Earnings",
          value: "KES 0",
          icon: DollarSign,
          change: "+0%",
        },
        {
          title: "Active Bookings",
          value: bookings?.filter((b) => b.status === "funded_escrow").length || 0,
          icon: Calendar,
          change: "Live",
        },
        {
          title: "Profile Views",
          value: "0",
          icon: Users,
          change: "This week",
        },
      ]
    : [
        {
          title: "Total Bookings",
          value: bookings?.length || 0,
          icon: Calendar,
          change: "All time",
        },
        {
          title: "Active Now",
          value: bookings?.filter((b) => b.status === "funded_escrow").length || 0,
          icon: TrendingUp,
          change: "In progress",
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
              {isCompanion ? (
                <Button variant="secondary" asChild>
                  <Link to="/profile">
                    Edit Profile
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="secondary" asChild>
                  <Link to="/explore">
                    <Search className="mr-2 w-4 h-4" />
                    Explore Companions
                  </Link>
                </Button>
              )}
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
            <Button variant="ghost" size="sm" asChild>
              <Link to="/bookings">View all</Link>
            </Button>
          </div>

          {bookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-4">
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
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No bookings yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isCompanion
                  ? "When clients book you, they'll appear here."
                  : "Start exploring companions to make your first booking."}
              </p>
              {!isCompanion && (
                <Button asChild>
                  <Link to="/explore">
                    <Search className="mr-2 w-4 h-4" />
                    Find Companions
                  </Link>
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
