import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = true }: ProtectedRouteProps) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();
  const hasToasted = useRef(false);

  // Loading State
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </div>
    );
  }

  // 1. Not logged in at all
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /**
   * 2. SOFT DELETE CHECK
   * Because of our SQL RLS policy, if a user is 'deleted', 
   * the profile will return null even if the auth session is valid.
   */
  if (user && !profile) {
    // We use a timeout to prevent state updates during rendering
    if (!hasToasted.current) {
      toast.error("This account has been deactivated. Please contact support.");
      hasToasted.current = true;
      signOut();
    }
    return <Navigate to="/login" replace />;
  }

  // 3. ONBOARDING CHECK
  if (requireOnboarding && profile && !profile.onboarding_completed) {
    // Don't redirect if already on onboarding page
    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // 4. Authorized and Active
  return <>{children}</>;
}