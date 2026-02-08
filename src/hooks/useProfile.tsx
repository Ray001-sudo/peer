import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
type ComplexionType = Database["public"]["Enums"]["complexion"];

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user?.id,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      if (!user?.id) throw new Error("No user logged in");

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });

  return {
    profile,
    isLoading,
    error,
    refetch,
    updateProfile: updateProfile.mutate,
    isUpdating: updateProfile.isPending,
  };
}

export function useCompanions(filters?: {
  location?: string;
  complexion?: string[];
  minAge?: number;
  maxAge?: number;
  bookingType?: string;
}) {
  return useQuery({
    queryKey: ["companions", filters],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role", "companion")
        .eq("onboarding_completed", true);

      if (filters?.location) {
        query = query.eq("location", filters.location);
      }

      if (filters?.complexion && filters.complexion.length > 0) {
        query = query.in("complexion", filters.complexion as ComplexionType[]);
      }

      if (filters?.minAge) {
        query = query.gte("age", filters.minAge);
      }

      if (filters?.maxAge) {
        query = query.lte("age", filters.maxAge);
      }

      if (filters?.bookingType === "hourly") {
        query = query.not("rate_hourly", "is", null);
      } else if (filters?.bookingType === "daily") {
        query = query.not("rate_daily", "is", null);
      } else if (filters?.bookingType === "weekly") {
        query = query.not("rate_weekly", "is", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useCompanionById(id: string | undefined) {
  return useQuery({
    queryKey: ["companion", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!id,
  });
}
