"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AppShell } from "@/components/app-shell";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo Mode Support
    const demoRole = localStorage.getItem("demo_role");
    if (demoRole) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        router.replace("/auth");
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.replace("/auth");
      }
    });

    return () => subscription?.unsubscribe();
  }, [router]);

  if (loading) return null; // or a loading spinner

  return <AppShell>{children}</AppShell>;
}

