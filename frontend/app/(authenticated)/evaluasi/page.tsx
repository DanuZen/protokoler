export default function Page() {
  return (
    <div className="min-h-screen bg-transparent">
      {/* ─── Hero Banner ─── */}
      <div className="relative px-6 md:px-10 pt-24 pb-32 overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">Evaluasi Kegiatan</h1>
          <p className="mt-3 text-slate-300 text-lg">Halaman evaluasi.</p>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="bg-slate-50 min-h-screen pt-4">
        <div className="px-6 md:px-10 -mt-24 relative z-10 space-y-8 max-w-[1400px] mx-auto">
          <div className="bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold">Halaman Evaluasi (Segera Hadir)</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
