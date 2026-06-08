import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo Mode Override
    const demoRole = typeof window !== "undefined" ? localStorage.getItem("demo_role") : null;
    if (demoRole) {
      const mockUser = {
        id: "demo-user-id",
        email: `demo@${demoRole}.com`,
        user_metadata: { nama_lengkap: `Demo ${demoRole}` }
      } as unknown as User;
      setSession({ user: mockUser } as Session);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription?.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useRole(user: User | null | undefined) {
  return useQuery({
    queryKey: ["user_role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Demo Mode Override
      const demoRole = typeof window !== "undefined" ? localStorage.getItem("demo_role") : null;
      if (demoRole) return demoRole as "admin" | "mahasiswa" | "pimpinan";

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      const roles = (data ?? []).map((r) => r.role);
      // priority: admin > pimpinan > mahasiswa
      if (roles.includes("admin")) return "admin" as const;
      if (roles.includes("pimpinan")) return "pimpinan" as const;
      return "mahasiswa" as const;
    },
  });
}
