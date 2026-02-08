import { motion } from "framer-motion";
import { Bell, Shield, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
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
                  <Button variant="outline" className="w-full justify-start">
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Report a Problem
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Terms of Service
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Privacy Policy
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sign Out */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-destructive/20">
                <CardContent className="pt-6">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
