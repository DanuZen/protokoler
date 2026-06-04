const fs = require('fs');

function replaceInFile(file, from, to) {
  if (!fs.existsSync(file)) { console.log('SKIP:', file); return; }
  let c = fs.readFileSync(file, 'utf8');
  if (c.includes(from)) {
    c = c.split(from).join(to);
    fs.writeFileSync(file, c, 'utf8');
    console.log('Patched:', file, '|', from.slice(0, 40));
  } else {
    console.log('NOT FOUND in', file, '|', from.slice(0, 40));
  }
}

// ────────── kegiatan/page.tsx ──────────
const KEG = 'app/(authenticated)/kegiatan/page.tsx';

replaceInFile(KEG,
  `import { supabase } from "@/lib/supabase";`,
  `import { kegiatanApi } from "@/lib/api";`
);
replaceInFile(KEG,
  `const { data, error } = await supabase.from("kegiatan").select("*").order("tanggal", { ascending: false });
      if (error) throw error;
      return data as Keg[];`,
  `return kegiatanApi.list() as unknown as Keg[];`
);
replaceInFile(KEG,
  `const { error } = await supabase.from("kegiatan").insert(form);
      if (error) throw error;`,
  `await kegiatanApi.create(form);`
);

// ────────── mahasiswa/page.tsx ──────────
const MHS = 'app/(authenticated)/mahasiswa/page.tsx';

replaceInFile(MHS,
  `import { supabase } from "@/lib/supabase";`,
  `import { mahasiswaApi } from "@/lib/api";`
);
replaceInFile(MHS,
  `const { data, error } = await supabase.from("mahasiswa").select("*").order("nama_lengkap");
      if (error) throw error;
      return data as Mhs[];`,
  `return mahasiswaApi.list() as unknown as Mhs[];`
);
replaceInFile(MHS,
  `const { error } = await supabase.from("mahasiswa").delete().eq("id", id);
      if (error) throw error;`,
  `await mahasiswaApi.remove(id);`
);
replaceInFile(MHS,
  `const payload = { ...form, angkatan: Number(form.angkatan) };
      if (editing) {
        const { error } = await supabase.from("mahasiswa").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("mahasiswa").insert(payload);
        if (error) throw error;
      }`,
  `const payload = { ...form, angkatan: Number(form.angkatan) };
      if (editing) {
        await mahasiswaApi.update(editing.id, payload);
      } else {
        await mahasiswaApi.create(payload);
      }`
);

// ────────── kegiatan/[id]/page.tsx ──────────
const KID = 'app/(authenticated)/kegiatan/[id]/page.tsx';

replaceInFile(KID,
  `import { supabase } from "@/lib/supabase";`,
  `import { kegiatanApi, penugasanApi, mahasiswaApi } from "@/lib/api";`
);
replaceInFile(KID,
  `const { data, error } = await supabase.from("kegiatan").select("*").eq("id", id).single();
      if (error) throw error;
      return data;`,
  `return kegiatanApi.get(id);`
);
replaceInFile(KID,
  `const { data, error } = await supabase.from("penugasan")
        .select("id, peran, status_konfirmasi, catatan, mahasiswa:mahasiswa_id(id, nim, nama_lengkap, prodi)")
        .eq("kegiatan_id", id);
      if (error) throw error;
      return data;`,
  `return penugasanApi.byKegiatan(id);`
);
replaceInFile(KID,
  `const { data, error } = await supabase.from("tamu").select("*").eq("kegiatan_id", id);
      if (error) throw error;
      return data;`,
  `return kegiatanApi.get(id).then((k) => (k as any).tamu ?? []);`
);
replaceInFile(KID,
  `const { error } = await supabase.from("penugasan").delete().eq("id", pid);
      if (error) throw error;`,
  `await penugasanApi.remove(pid);`
);
replaceInFile(KID,
  `const { error } = await supabase.from("tamu").delete().eq("id", tid);
      if (error) throw error;`,
  `await fetch('/api/tamu/' + tid, { method: 'DELETE' });`
);
replaceInFile(KID,
  `const { data } = await supabase.from("mahasiswa").select("id, nim, nama_lengkap").eq("status", "aktif").order("nama_lengkap");
      return data ?? [];`,
  `return mahasiswaApi.list();`
);
replaceInFile(KID,
  `const { data } = await supabase.from("penugasan")
        .select("kegiatan:kegiatan_id(id, nama_kegiatan, tanggal, jam_mulai, jam_selesai)")
        .eq("mahasiswa_id", mahasiswaId);
      return (data ?? []).filter((p: any) => {
        const k = p.kegiatan;
        if (!k || k.id === kegiatanId || k.tanggal !== tanggal) return false;
        return !(k.jam_selesai <= jamMulai || k.jam_mulai >= jamSelesai);
      });`,
  `return penugasanApi.byMahasiswa(mahasiswaId).then((list) =>
        (list as any[]).filter((p: any) => {
          const k = p.kegiatan;
          if (!k || k.id === kegiatanId || k.tanggal !== tanggal) return false;
          return !(k.jam_selesai <= jamMulai || k.jam_mulai >= jamSelesai);
        })
      );`
);
replaceInFile(KID,
  `const { error } = await supabase.from("penugasan").insert({ kegiatan_id: kegiatanId, mahasiswa_id: mahasiswaId, peran });
      if (error) throw error;`,
  `await penugasanApi.create({ kegiatan_id: kegiatanId, mahasiswa_id: mahasiswaId, peran });`
);
replaceInFile(KID,
  `const { error } = await supabase.from("tamu").insert({ ...form, kegiatan_id: kegiatanId });
      if (error) throw error;`,
  `await fetch('/api/tamu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, kegiatan_id: kegiatanId }) });`
);

console.log('\nAll patches done!');
