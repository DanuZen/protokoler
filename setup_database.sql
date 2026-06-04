-- 1. ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'mahasiswa', 'pimpinan');
CREATE TYPE public.mahasiswa_status AS ENUM ('aktif', 'tidak_aktif', 'cuti');
CREATE TYPE public.bentuk_kegiatan AS ENUM ('wisuda', 'kunjungan', 'seminar', 'pelantikan', 'rapat_resmi', 'lainnya');
CREATE TYPE public.kegiatan_status AS ENUM ('draft', 'terkonfirmasi', 'selesai', 'batal');
CREATE TYPE public.peran_penugasan AS ENUM ('lo', 'protokoler');
CREATE TYPE public.konfirmasi_status AS ENUM ('pending', 'dikonfirmasi', 'ditolak');

-- 2. UPDATED_AT HELPER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- 3. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all_authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. USER_ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- 5. NEW USER TRIGGER (AUTO-MAHASISWA)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'mahasiswa');
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. MAHASISWA TABLE
CREATE TABLE public.mahasiswa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nim TEXT NOT NULL UNIQUE,
  nama_lengkap TEXT NOT NULL,
  prodi TEXT NOT NULL,
  angkatan INT NOT NULL,
  no_hp TEXT,
  email TEXT,
  foto_url TEXT,
  status public.mahasiswa_status NOT NULL DEFAULT 'aktif',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mahasiswa TO authenticated;
GRANT ALL ON public.mahasiswa TO service_role;
ALTER TABLE public.mahasiswa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mahasiswa_select_authenticated" ON public.mahasiswa FOR SELECT TO authenticated USING (true);
CREATE POLICY "mahasiswa_admin_insert" ON public.mahasiswa FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "mahasiswa_admin_update" ON public.mahasiswa FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "mahasiswa_admin_delete" ON public.mahasiswa FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_mahasiswa_updated BEFORE UPDATE ON public.mahasiswa FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. KEGIATAN TABLE
CREATE TABLE public.kegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_kegiatan TEXT NOT NULL,
  bentuk public.bentuk_kegiatan NOT NULL DEFAULT 'lainnya',
  tanggal DATE NOT NULL,
  jam_mulai TIME NOT NULL,
  jam_selesai TIME NOT NULL,
  lokasi TEXT NOT NULL,
  deskripsi TEXT,
  status public.kegiatan_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kegiatan TO authenticated;
GRANT ALL ON public.kegiatan TO service_role;
ALTER TABLE public.kegiatan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kegiatan_select_authenticated" ON public.kegiatan FOR SELECT TO authenticated USING (true);
CREATE POLICY "kegiatan_admin_insert" ON public.kegiatan FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "kegiatan_admin_update" ON public.kegiatan FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "kegiatan_admin_delete" ON public.kegiatan FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_kegiatan_updated BEFORE UPDATE ON public.kegiatan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. TAMU TABLE
CREATE TABLE public.tamu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID NOT NULL REFERENCES public.kegiatan(id) ON DELETE CASCADE,
  nama_tamu TEXT NOT NULL,
  jabatan TEXT,
  instansi TEXT,
  jumlah_rombongan INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tamu TO authenticated;
GRANT ALL ON public.tamu TO service_role;
ALTER TABLE public.tamu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tamu_select_authenticated" ON public.tamu FOR SELECT TO authenticated USING (true);
CREATE POLICY "tamu_admin_all" ON public.tamu FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- 9. PENUGASAN TABLE
CREATE TABLE public.penugasan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kegiatan_id UUID NOT NULL REFERENCES public.kegiatan(id) ON DELETE CASCADE,
  mahasiswa_id UUID NOT NULL REFERENCES public.mahasiswa(id) ON DELETE CASCADE,
  peran public.peran_penugasan NOT NULL,
  status_konfirmasi public.konfirmasi_status NOT NULL DEFAULT 'pending',
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(kegiatan_id, mahasiswa_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.penugasan TO authenticated;
GRANT ALL ON public.penugasan TO service_role;
ALTER TABLE public.penugasan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "penugasan_select_authenticated" ON public.penugasan FOR SELECT TO authenticated USING (true);
CREATE POLICY "penugasan_admin_insert" ON public.penugasan FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "penugasan_admin_delete" ON public.penugasan FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "penugasan_update_admin_or_self" ON public.penugasan FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(),'admin') OR
  EXISTS (SELECT 1 FROM public.mahasiswa m WHERE m.id = penugasan.mahasiswa_id AND m.user_id = auth.uid())
);
CREATE TRIGGER trg_penugasan_updated BEFORE UPDATE ON public.penugasan FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10. INDEXES & SECURITY
CREATE INDEX idx_penugasan_kegiatan ON public.penugasan(kegiatan_id);
CREATE INDEX idx_penugasan_mahasiswa ON public.penugasan(mahasiswa_id);
CREATE INDEX idx_kegiatan_tanggal ON public.kegiatan(tanggal);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
