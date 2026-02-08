import { useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
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
import { KENYAN_LOCATIONS, COMPLEXION_OPTIONS, HEIGHT_OPTIONS } from "@/lib/constants";

const profileSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  phone_number: z.string().regex(/^254\d{9}$/, "Phone must be in 254XXXXXXXXX format"),
  location: z.string().optional(),
  age: z.number().min(18).max(100).optional(),
  height: z.string().optional(),
  complexion: z.enum(["Fair", "Brown", "Dark", "Olive"]).optional(),
  bio: z.string().max(500).optional(),
  rate_hourly: z.number().min(0).optional(),
  rate_daily: z.number().min(0).optional(),
  rate_weekly: z.number().min(0).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { profile, isLoading, updateProfile, isUpdating, refetch } = useProfile();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name || "",
      phone_number: profile?.phone_number || "254",
      location: profile?.location || "",
      age: profile?.age || undefined,
      height: profile?.height || "",
      complexion: profile?.complexion as any,
      bio: profile?.bio || "",
      rate_hourly: profile?.rate_hourly ? Number(profile.rate_hourly) : undefined,
      rate_daily: profile?.rate_daily ? Number(profile.rate_daily) : undefined,
      rate_weekly: profile?.rate_weekly ? Number(profile.rate_weekly) : undefined,
    },
  });

  const isCompanion = profile?.role === "companion";

  const onSubmit = (data: ProfileFormData) => {
    updateProfile({
      full_name: data.full_name,
      phone_number: data.phone_number,
      location: data.location || null,
      age: data.age || null,
      height: data.height || null,
      complexion: data.complexion || null,
      bio: data.bio || null,
      rate_hourly: data.rate_hourly || null,
      rate_daily: data.rate_daily || null,
      rate_weekly: data.rate_weekly || null,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-24 rounded-full mx-auto" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

          {/* Avatar Upload */}
          <div className="mb-8">
            <AvatarUpload
              currentAvatarUrl={avatarUrl || profile?.avatar_url || null}
              fullName={profile?.full_name || null}
              onUploadComplete={(url) => {
                setAvatarUrl(url);
                refetch();
              }}
            />
            <p className="text-center text-sm text-muted-foreground mt-2">
              Click the camera icon to upload a new photo
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="254712345678" {...field} />
                      </FormControl>
                      <FormDescription>M-Pesa number (254...)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isCompanion && (
                <>
                  {/* Location & Age */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {KENYAN_LOCATIONS.map((loc) => (
                                <SelectItem key={loc} value={loc}>
                                  {loc}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={18}
                              max={100}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || undefined)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Height & Complexion */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select height" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {HEIGHT_OPTIONS.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="complexion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complexion</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select complexion" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COMPLEXION_OPTIONS.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                  {c.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Bio */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell clients about yourself..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Rates */}
                  <div className="bg-accent/50 rounded-xl p-4">
                    <h4 className="font-medium mb-4">Rates (KES)</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="rate_hourly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rate_daily"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rate_weekly"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weekly</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || undefined)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                type="submit"
                size="lg"
                variant="hero"
                className="w-full"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
