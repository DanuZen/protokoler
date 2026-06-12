import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Medal, Trophy, Award } from "lucide-react";

type BadgeKategoriProps = {
  kategori: "perak" | "silver" | "gold" | string | null;
  className?: string;
};

export function BadgeKategori({ kategori, className }: BadgeKategoriProps) {
  if (!kategori) return null;

  const normalized = kategori.toLowerCase();
  
  let visual = {
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: Award,
    label: kategori
  };

  if (normalized === "perak") {
    visual = {
      color: "bg-slate-200 text-slate-700 border-slate-300 shadow-sm",
      icon: Medal,
      label: "Perak"
    };
  } else if (normalized === "silver") {
    visual = {
      color: "bg-slate-200 text-slate-800 border-slate-400 shadow-sm",
      icon: Medal,
      label: "Silver"
    };
  } else if (normalized === "gold") {
    visual = {
      color: "bg-[#C9A84C] text-slate-900 border-[#C9A84C] shadow-sm",
      icon: Trophy,
      label: "Gold"
    };
  }

  const Icon = visual.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-none font-bold uppercase tracking-wider flex items-center gap-1.5",
        visual.color,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {visual.label}
    </Badge>
  );
}
