import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ShieldCheck, LayoutDashboard, Users, CalendarDays, ClipboardList, FileBarChart, LogOut, UserCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth, useRole } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

type Role = "admin" | "mahasiswa" | "pimpinan";

const items: { to: string; label: string; icon: typeof Users; roles: Role[] }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "mahasiswa", "pimpinan"] },
  { to: "/kegiatan", label: "Kegiatan", icon: CalendarDays, roles: ["admin", "mahasiswa", "pimpinan"] },
  { to: "/mahasiswa", label: "Mahasiswa", icon: Users, roles: ["admin", "pimpinan"] },
  { to: "/jadwal-saya", label: "Jadwal Saya", icon: ClipboardList, roles: ["admin", "mahasiswa"] },
  { to: "/laporan", label: "Laporan", icon: FileBarChart, roles: ["admin", "pimpinan"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: role } = useRole(user);
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  };

  const visible = items.filter((i) => !role || i.roles.includes(role));

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-gradient-gold">
            <ShieldCheck className="h-5 w-5 text-gold-foreground" />
          </div>
          <div>
            <div className="font-display text-lg font-bold">SiProto</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">Protokoler Universitas</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {visible.map((i) => {
            const active = path === i.to || path.startsWith(i.to + "/");
            return (
              <Link
                key={i.to}
                to={i.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <i.icon className="h-4 w-4" />
                {i.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-md p-2">
            <UserCircle2 className="h-8 w-8 text-sidebar-foreground/70" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.email}</div>
              <Badge variant="secondary" className="mt-0.5 text-[10px] capitalize">{role ?? "..."}</Badge>
            </div>
            <button onClick={signOut} title="Keluar" className="rounded p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur md:justify-end">
          <div className="md:hidden flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="font-display font-bold">SiProto</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="capitalize">{role ?? "..."}</Badge>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="mr-1.5 h-4 w-4" />Keluar</Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
