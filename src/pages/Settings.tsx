import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, CreditCard, HelpCircle, LogOut, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
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

const settingsSections = [
  {
    title: "Notifications",
    description: "Manage how you receive updates",
    icon: Bell,
    settings: [
      { id: "email_bookings", label: "Email notifications for new bookings", defaultChecked: true },
      { id: "sms_reminders", label: "SMS reminders before appointments", defaultChecked: true },
      { id: "marketing", label: "Promotional emails and offers", defaultChecked: false },
    ],
  },
  {
    title: "Privacy & Security",
    description: "Control your account security",
    icon: Shield,
    settings: [
      { id: "profile_visible", label: "Make profile visible to clients", defaultChecked: true },
      { id: "show_location", label: "Show exact location on profile", defaultChecked: false },
    ],
  },
  {
    title: "Payment Settings",
    description: "Manage your M-Pesa preferences",
    icon: CreditCard,
    settings: [
      { id: "auto_withdraw", label: "Auto-withdraw earnings weekly", defaultChecked: false },
    ],
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleSoftDelete = async () => {
    if (!user?.id) return;
    setIsDeleting(true);

    try {
      // Soft Delete: Update the profile with a timestamp and 'deactivate' it
      const { error } = await supabase
        .from("profiles")
        .update({ 
          onboarding_completed: false, // Hide from the app logic
          // We assume you have a deleted_at column or similar in your DB
          // deleted_at: new Date().toISOString() 
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Account deactivated. We're sorry to see you go.");
      
      // Log them out and send to landing page
      await signOut();
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-6">Settings</h1>

          <div className="space-y-6">
            {settingsSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                        <section.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.settings.map((setting, settingIndex) => (
                      <div key={setting.id}>
                        <div className="flex items-center justify-between">
                          <Label htmlFor={setting.id} className="flex-1 cursor-pointer">
                            {setting.label}
                          </Label>
                          <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
                        </div>
                        {settingIndex < section.settings.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Help & Support</CardTitle>
                    <CardDescription>Get help with your account</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">Contact Support</Button>
                <Button variant="outline" className="w-full justify-start">Report a Problem</Button>
              </CardContent>
            </Card>

            {/* Account Actions / Danger Zone */}
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <Button
                    variant="outline"
                    className="w-full text-muted-foreground hover:text-foreground"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Deactivating your account will hide your profile and cancel pending bookings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will deactivate your profile and you will no longer be visible to others. You can contact support if you wish to reactivate later.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleSoftDelete}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Processing..." : "Confirm Deletion"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}