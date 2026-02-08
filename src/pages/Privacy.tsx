import { motion } from "framer-motion";
import { ShieldCheck, Lock, EyeOff, Bell } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    icon: Lock,
    title: "1. Data Collection",
    content: "We collect information you provide directly to us, including your name, phone number (for M-Pesa transactions), national ID details (for verification), and profile photos. We also collect location data to help you find companions nearby.",
  },
  {
    icon: ShieldCheck,
    title: "2. How We Use Data",
    content: "Your data is used to maintain your account, process payments, and ensure the safety of our community. We perform background checks on companions to maintain the 'verified' status and strictly platonic nature of the platform.",
  },
  {
    icon: EyeOff,
    title: "3. Data Sharing",
    content: "We do not sell your personal data. We share your information only with your consent (e.g., sharing your name with a companion once a booking is confirmed) or when required by Kenyan law.",
  },
  {
    icon: Bell,
    title: "4. Your Rights",
    content: "You have the right to access, correct, or delete your personal information at any time through your account settings. You can also opt-out of marketing communications while keeping essential transaction alerts.",
  },
];

export default function Privacy() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold"
          >
            Privacy Policy
          </motion.h1>
          <p className="text-muted-foreground">
            Last updated: February 2026. Your privacy is our top priority.
          </p>
        </div>

        <div className="grid gap-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-none bg-accent/30">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">{section.title}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl border border-dashed text-center"
        >
          <p className="text-sm text-muted-foreground">
            If you have any questions regarding our privacy practices, please contact us through our 
            <a href="/support" className="text-primary font-medium ml-1 hover:underline">
              Support Center
            </a>.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}