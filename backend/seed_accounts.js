import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://gxupxgvprzykvcpllgme.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4dXB4Z3Zwcnp5a3ZjcGxsZ21lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU5NjU0NiwiZXhwIjoyMDk2MTcyNTQ2fQ.8OwzflzPpLTD-qk4vAi72b_3PfWbzwIhbw_c8KfDgkE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seed() {
  console.log("Memulai pembuatan akun demo...");

  const users = [
    { email: 'admin@siproto.com', password: 'admin123', nama: 'Administrator SiProto', role: 'admin' },
    { email: 'mhs@siproto.com', password: 'mhs123', nama: 'Mahasiswa Demo', role: 'mahasiswa' },
    { email: 'pimpinan@siproto.com', password: 'pimpinan123', nama: 'Pimpinan Universitas', role: 'pimpinan' },
  ];

  for (const u of users) {
    // 1. Create User in Auth
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { nama_lengkap: u.nama }
    });

    if (authErr) {
      console.log(`[!] Gagal membuat ${u.email}: ${authErr.message}`);
      continue;
    }

    console.log(`[+] Akun ${u.email} berhasil dibuat di Auth.`);

    // Note: The trigger handle_new_user() will automatically create a profile and assign 'mahasiswa' role.
    // So we just need to update the role in user_roles table if it's not mahasiswa.
    
    // Wait a second for trigger to finish
    await new Promise(res => setTimeout(res, 1000));

    if (u.role !== 'mahasiswa') {
      const { error: roleErr } = await supabase
        .from('user_roles')
        .update({ role: u.role })
        .eq('user_id', authData.user.id);
        
      if (roleErr) console.log(`[!] Gagal mengupdate role untuk ${u.email}:`, roleErr);
      else console.log(`[+] Role ${u.role} berhasil di-set untuk ${u.email}`);
    }
  }

  console.log("Selesai!");
}

seed();
