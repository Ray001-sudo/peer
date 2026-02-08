import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Briefcase, CheckCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { KENYAN_LOCATIONS, COMPLEXION_OPTIONS, HEIGHT_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";

// Form Validation Schemas
const clientSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  phone_number: z.string().regex(/^254\d{9}$/, "Phone must be in 254XXXXXXXXX format"),
});

const companionSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  phone_number: z.string().regex(/^254\d{9}$/, "Phone must be in 254XXXXXXXXX format"),
  location: z.string().min(1, "Location is required"),
  age: z.number().min(18, "Must be 18 or older").max(100),
  height: z.string().min(1, "Height is required"),
  complexion: z.enum(["Fair", "Brown", "Dark", "Olive"]),
  bio: z.string().min(20, "Bio must be at least 20 characters").max(500),
  rate_hourly: z.number().min(100, "Hourly rate must be at least 100 KES"),
  rate_daily: z.number().min(500, "Daily rate must be at least 500 KES"),
  rate_weekly: z.number().min(2000, "Weekly rate must be at least 2000 KES"),
});

type ClientFormData = z.infer<typeof clientSchema>;
type CompanionFormData = z.infer<typeof companionSchema>;

export default function Onboarding() {
  const [step, setStep] = useState<"role" | "details">("role");
  const [selectedRole, setSelectedRole] = useState<"client" | "companion" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: { full_name: "", phone_number: "254" },
  });

  const companionForm = useForm<CompanionFormData>({
    resolver: zodResolver(companionSchema),
    defaultValues: {
      full_name: "",
      phone_number: "254",
      location: "",
      age: 18,
      height: "",
      bio: "",
      rate_hourly: 500,
      rate_daily: 3000,
      rate_weekly: 15000,
    },
  });

  const handleRoleSelect = (role: "client" | "companion") => {
    setSelectedRole(role);
    setStep("details");
  };

  const onClientSubmit = async (data: ClientFormData) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: "client",
          full_name: data.full_name,
          phone_number: data.phone_number,
          tos_accepted: true,
          tos_timestamp: new Date().toISOString(),
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Invalidate the profile query to update the global auth state/guards
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      toast.success("Profile completed!");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  const onCompanionSubmit = async (data: CompanionFormData) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: "companion",
          full_name: data.full_name,
          phone_number: data.phone_number,
          location: data.location,
          age: data.age,
          height: data.height,
          complexion: data.complexion,
          bio: data.bio,
          rate_hourly: data.rate_hourly,
          rate_daily: data.rate_daily,
          rate_weekly: data.rate_weekly,
          tos_accepted: true,
          tos_timestamp: new Date().toISOString(),
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast.success("Profile completed!");
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">P</span>
          </div>
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            {step === "role" 
              ? "Choose how you want to use PeerPair" 
              : "Tell us more about yourself"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "role" ? (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              <button
                onClick={() => handleRoleSelect("client")}
                className="p-8 rounded-2xl border-2 border-border hover:border-primary hover:bg-accent/50 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <User className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">I'm a Client</h3>
                <p className="text-muted-foreground text-sm">Find and book verified companions.</p>
              </button>

              <button
                onClick={() => handleRoleSelect("companion")}
                className="p-8 rounded-2xl border-2 border-border hover:border-primary hover:bg-accent/50 transition-all text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold mb-2">I'm a Companion</h3>
                <p className="text-muted-foreground text-sm">Offer services and connect with clients.</p>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-2xl border p-8"
            >
              <Button variant="ghost" onClick={() => setStep("role")} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {selectedRole === "client" ? (
                <Form {...clientForm}>
                  <form onSubmit={clientForm.handleSubmit(onClientSubmit)} className="space-y-6">
                    <FormField control={clientForm.control} name="full_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={clientForm.control} name="phone_number" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (M-Pesa)</FormLabel>
                        <FormControl><Input placeholder="254712345678" {...field} /></FormControl>
                        <FormDescription>Format: 254XXXXXXXXX</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Complete Profile"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...companionForm}>
                  <form onSubmit={companionForm.handleSubmit(onCompanionSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={companionForm.control} name="full_name" render={({ field }) => (
                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={companionForm.control} name="phone_number" render={({ field }) => (
                        <FormItem><FormLabel>Phone (M-Pesa)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={companionForm.control} name="location" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger></FormControl>
                            <SelectContent>{KENYAN_LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={companionForm.control} name="age" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 18)} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField control={companionForm.control} name="height" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Height" /></SelectTrigger></FormControl>
                            <SelectContent>{HEIGHT_OPTIONS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={companionForm.control} name="complexion" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complexion</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Complexion" /></SelectTrigger></FormControl>
                            <SelectContent>{COMPLEXION_OPTIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={companionForm.control} name="bio" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl><Textarea className="min-h-[80px]" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-lg">
                      <FormField control={companionForm.control} name="rate_hourly" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Hourly</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl></FormItem>
                      )} />
                      <FormField control={companionForm.control} name="rate_daily" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Daily</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl></FormItem>
                      )} />
                      <FormField control={companionForm.control} name="rate_weekly" render={({ field }) => (
                        <FormItem><FormLabel className="text-xs">Weekly</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl></FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Saving..." : <><CheckCircle className="mr-2 h-4 w-4" /> Finish Onboarding</>}
                    </Button>
                  </form>
                </Form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}