import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  Send, 
  LifeBuoy, 
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const contactMethods = [
  {
    title: "WhatsApp Support",
    description: "Average response: 15 mins",
    icon: MessageCircle,
    color: "bg-green-500/10 text-green-600",
    action: "Chat Now",
    link: "https://wa.me/254707253574", 
  },
  {
    title: "Email Us",
    description: "Average response: 2 hours",
    icon: Mail,
    color: "bg-blue-500/10 text-blue-600",
    action: "Send Email",
    link: "mailto:support@peer.com",
  },
  {
    title: "Call Support",
    description: "Available 9am - 6pm",
    icon: Phone,
    color: "bg-purple-500/10 text-purple-600",
    action: "Call Now",
    link: "tel:+254700000000",
  },
];

export default function ContactSupport() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending a message
    setTimeout(() => {
      toast.success("Message sent! Our team will get back to you shortly.");
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
          >
            <LifeBuoy className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold">How can we help?</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Our team is here to help you with any issues regarding your account, bookings, or safety.
          </p>
        </div>

        {/* Quick Contact Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden group">
                <a href={method.link} target="_blank" rel="noopener noreferrer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <method.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold mb-1">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {method.description}
                    </p>
                    <div className="flex items-center text-sm font-medium text-primary">
                      {method.action}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </a>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Support Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-primary/10">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll investigate your issue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Issue Subject</Label>
                    <Input id="subject" placeholder="e.g., Booking Dispute" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="account">Account Access</option>
                      <option value="payment">Payment/M-Pesa</option>
                      <option value="safety">Safety Concern</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your issue in detail..." 
                    className="min-h-[150px]"
                    required 
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Shortcut */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Looking for quick answers?{" "}
            <Button variant="link" className="p-0 h-auto font-semibold">
              Visit our Help Center
            </Button>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}