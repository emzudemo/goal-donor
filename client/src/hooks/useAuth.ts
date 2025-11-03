import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { User } from "@shared/schema";
import { supabase } from "@/lib/supabaseClient";
import { queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Invalidate the user query to refetch user data
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } else if (event === 'SIGNED_OUT') {
        // Clear all queries when signed out
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
