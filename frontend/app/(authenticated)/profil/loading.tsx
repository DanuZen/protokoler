import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] w-full h-full">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 animate-ping rounded-full bg-red-700/20" />
          <Loader2 className="h-8 w-8 animate-spin text-red-700 relative z-10" />
        </div>
        <p className="text-sm font-bold text-slate-500 animate-pulse">Memuat halaman...</p>
      </div>
    </div>
  );
}
