export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      kegiatan: {
        Row: {
          bentuk: Database["public"]["Enums"]["bentuk_kegiatan"]
          created_at: string
          created_by: string | null
          deskripsi: string | null
          id: string
          jam_mulai: string
          jam_selesai: string
          lokasi: string
          nama_kegiatan: string
          status: Database["public"]["Enums"]["kegiatan_status"]
          tanggal: string
          updated_at: string
        }
        Insert: {
          bentuk?: Database["public"]["Enums"]["bentuk_kegiatan"]
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          id?: string
          jam_mulai: string
          jam_selesai: string
          lokasi: string
          nama_kegiatan: string
          status?: Database["public"]["Enums"]["kegiatan_status"]
          tanggal: string
          updated_at?: string
        }
        Update: {
          bentuk?: Database["public"]["Enums"]["bentuk_kegiatan"]
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          id?: string
          jam_mulai?: string
          jam_selesai?: string
          lokasi?: string
          nama_kegiatan?: string
          status?: Database["public"]["Enums"]["kegiatan_status"]
          tanggal?: string
          updated_at?: string
        }
        Relationships: []
      }
      mahasiswa: {
        Row: {
          angkatan: number
          created_at: string
          email: string | null
          foto_url: string | null
          id: string
          nama_lengkap: string
          nim: string
          no_hp: string | null
          prodi: string
          status: Database["public"]["Enums"]["mahasiswa_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          angkatan: number
          created_at?: string
          email?: string | null
          foto_url?: string | null
          id?: string
          nama_lengkap: string
          nim: string
          no_hp?: string | null
          prodi: string
          status?: Database["public"]["Enums"]["mahasiswa_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          angkatan?: number
          created_at?: string
          email?: string | null
          foto_url?: string | null
          id?: string
          nama_lengkap?: string
          nim?: string
          no_hp?: string | null
          prodi?: string
          status?: Database["public"]["Enums"]["mahasiswa_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      penugasan: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          kegiatan_id: string
          mahasiswa_id: string
          peran: Database["public"]["Enums"]["peran_penugasan"]
          status_konfirmasi: Database["public"]["Enums"]["konfirmasi_status"]
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          kegiatan_id: string
          mahasiswa_id: string
          peran: Database["public"]["Enums"]["peran_penugasan"]
          status_konfirmasi?: Database["public"]["Enums"]["konfirmasi_status"]
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          kegiatan_id?: string
          mahasiswa_id?: string
          peran?: Database["public"]["Enums"]["peran_penugasan"]
          status_konfirmasi?: Database["public"]["Enums"]["konfirmasi_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "penugasan_kegiatan_id_fkey"
            columns: ["kegiatan_id"]
            isOneToOne: false
            referencedRelation: "kegiatan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penugasan_mahasiswa_id_fkey"
            columns: ["mahasiswa_id"]
            isOneToOne: false
            referencedRelation: "mahasiswa"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nama_lengkap: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nama_lengkap: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nama_lengkap?: string
          updated_at?: string
        }
        Relationships: []
      }
      tamu: {
        Row: {
          created_at: string
          id: string
          instansi: string | null
          jabatan: string | null
          jumlah_rombongan: number | null
          kegiatan_id: string
          nama_tamu: string
        }
        Insert: {
          created_at?: string
          id?: string
          instansi?: string | null
          jabatan?: string | null
          jumlah_rombongan?: number | null
          kegiatan_id: string
          nama_tamu: string
        }
        Update: {
          created_at?: string
          id?: string
          instansi?: string | null
          jabatan?: string | null
          jumlah_rombongan?: number | null
          kegiatan_id?: string
          nama_tamu?: string
        }
        Relationships: [
          {
            foreignKeyName: "tamu_kegiatan_id_fkey"
            columns: ["kegiatan_id"]
            isOneToOne: false
            referencedRelation: "kegiatan"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "mahasiswa" | "pimpinan"
      bentuk_kegiatan:
        | "wisuda"
        | "kunjungan"
        | "seminar"
        | "pelantikan"
        | "rapat_resmi"
        | "lainnya"
      kegiatan_status: "draft" | "terkonfirmasi" | "selesai" | "batal"
      konfirmasi_status: "pending" | "dikonfirmasi" | "ditolak"
      mahasiswa_status: "aktif" | "tidak_aktif" | "cuti"
      peran_penugasan: "lo" | "protokoler"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "mahasiswa", "pimpinan"],
      bentuk_kegiatan: [
        "wisuda",
        "kunjungan",
        "seminar",
        "pelantikan",
        "rapat_resmi",
        "lainnya",
      ],
      kegiatan_status: ["draft", "terkonfirmasi", "selesai", "batal"],
      konfirmasi_status: ["pending", "dikonfirmasi", "ditolak"],
      mahasiswa_status: ["aktif", "tidak_aktif", "cuti"],
      peran_penugasan: ["lo", "protokoler"],
    },
  },
} as const
