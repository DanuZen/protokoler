import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeKategoriProps = {
  kategori: "perak" | "silver" | "gold" | string | null;
  className?: string;
};

export function BadgeKategori({ kategori, className }: BadgeKategoriProps) {
  if (!kategori) return null;

  const normalized = kategori.toLowerCase();
  
  let visual = {
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: "🏅",
    label: kategori
  };

  if (normalized === "perak") {
    visual = {
      color: "bg-slate-200 text-slate-700 border-slate-300 shadow-sm",
      icon: "🥈",
      label: "Perak"
    };
  } else if (normalized === "silver") {
    visual = {
      color: "bg-zinc-200 text-zinc-800 border-zinc-400 shadow-sm",
      icon: "🥇", // using 1st place icon for silver since perak is 2nd in this custom logic, or whatever emoji fits
      label: "Silver"
    };
  } else if (normalized === "gold") {
    visual = {
      color: "bg-gradient-gold text-gold-foreground border-yellow-500 shadow-md",
      icon: "🏆",
      label: "Gold"
    };
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-none font-bold uppercase tracking-wider flex items-center gap-1.5",
        visual.color,
        className
      )}
    >
      <span className="text-base leading-none">{visual.icon}</span>
      {visual.label}
    </Badge>
  );
}
