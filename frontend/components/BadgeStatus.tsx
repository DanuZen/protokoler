import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type BadgeStatusProps = {
  status?: string;
  className?: string;
};

export function BadgeStatus({ status = "", className }: BadgeStatusProps) {
  if (!status) return <span className="text-slate-400 text-xs italic">-</span>;
  
  const normalizedStatus = status.toLowerCase().replace(/_/g, " ");

  let variantClass = "bg-slate-200 text-slate-800 border-slate-300"; // default

  switch (normalizedStatus) {
    // Success / Green
    case "aktif":
    case "diterima":
    case "selesai":
    case "hadir":
      variantClass = "bg-green-100 text-green-800 border-green-200";
      break;

    // Warning / Yellow-Orange
    case "pending":
    case "pending verification":
    case "draf":
    case "dialihkan":
    case "izin":
      variantClass = "bg-orange-100 text-orange-800 border-orange-200";
      break;

    // Danger / Red
    case "ditolak":
    case "tidak aktif":
    case "batal":
    case "tidak hadir":
      variantClass = "bg-red-100 text-red-800 border-red-200";
      break;

    // Info / Blue
    case "publik":
    case "berlangsung":
      variantClass = "bg-blue-100 text-blue-800 border-blue-200";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={cn("rounded-none font-semibold capitalize", variantClass, className)}
    >
      {normalizedStatus}
    </Badge>
  );
}
