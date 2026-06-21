import { Injectable, ConflictException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RoleEnum } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async register(dto: RegisterDto, files: { foto_setengah_badan?: any; foto_full_body?: any }) {
    // 1. Verify unique constraints
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const existingProtokoler = await this.prisma.protokoler.findUnique({
      where: { nim: dto.nim },
    });
    if (existingProtokoler) {
      throw new ConflictException('NIM sudah terdaftar');
    }

    // Check if files are uploaded
    if (!files.foto_setengah_badan || !files.foto_full_body) {
      throw new UnprocessableEntityException('Foto setengah badan dan full body wajib diunggah');
    }

    const fotoSetengahFile = files.foto_setengah_badan[0];
    const fotoFullFile = files.foto_full_body[0];

    // 2. Create user in Supabase Auth
    const supabase = this.supabaseService.getClient();
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { nama_lengkap: dto.nama_lengkap },
    });

    if (authErr || !authData.user) {
      throw new UnprocessableEntityException(authErr?.message || 'Gagal mendaftarkan akun di Supabase Auth');
    }

    const userId = authData.user.id;

    try {
      // 3. Upload images to Supabase Storage
      const extensionSetengah = fotoSetengahFile.originalname.split('.').pop() || 'jpg';
      const extensionFull = fotoFullFile.originalname.split('.').pop() || 'jpg';

      const fotoSetengahUrl = await this.supabaseService.uploadFile(
        'protokoler-photos',
        `setengah_badan/${userId}_setengah_badan.${extensionSetengah}`,
        fotoSetengahFile.buffer,
        fotoSetengahFile.mimetype,
      );

      const fotoFullUrl = await this.supabaseService.uploadFile(
        'protokoler-photos',
        `full_body/${userId}_full_body.${extensionFull}`,
        fotoFullFile.buffer,
        fotoFullFile.mimetype,
      );

      // Sync avatar and photo URLs to Supabase Auth metadata
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          nama_lengkap: dto.nama_lengkap,
          avatar_url: fotoSetengahUrl,
          foto_setengah_badan_url: fotoSetengahUrl,
        },
      });

      // 4. Save to Database using Prisma transaction
      const newUser = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            id: userId,
            email: dto.email,
            role: 'protokoler',
          },
        });

        await tx.protokoler.create({
          data: {
            user_id: userId,
            nim: dto.nim,
            nama_lengkap: dto.nama_lengkap,
            prodi: dto.prodi,
            departemen: dto.departemen,
            fakultas: dto.fakultas,
            no_hp: dto.no_hp,
            foto_setengah_badan_url: fotoSetengahUrl,
            foto_full_body_url: fotoFullUrl,
            status_akun: 'pending',
          },
        });

        return user;
      });

      return {
        message: 'Pendaftaran berhasil. Akun menunggu verifikasi admin.',
        data: {
          id: newUser.id,
          nim: dto.nim,
          nama_lengkap: dto.nama_lengkap,
          status_akun: 'pending',
        },
      };
    } catch (err: any) {
      // Rollback Supabase user if database insert fails
      await supabase.auth.admin.deleteUser(userId);
      throw new UnprocessableEntityException(err.message || 'Gagal menyimpan data pendaftaran ke database');
    }
  }

  async login(dto: LoginDto) {
    const supabase = this.supabaseService.getClient();
    const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (authErr || !authData.user || !authData.session) {
      throw new UnauthorizedException('Token tidak valid atau email/password salah');
    }

    // Query User details and role from Prisma
    let dbUser = await this.prisma.user.findUnique({
      where: { id: authData.user.id },
      include: { protokoler: true },
    });

    if (!dbUser) {
      // Clean up stale user record with same email to avoid unique constraint issues
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: authData.user.email || '' },
      });

      if (existingUserByEmail) {
        await this.prisma.user.delete({
          where: { id: existingUserByEmail.id }
        });
      }

      // Auto-provision user in database
      let role = 'protokoler';
      const metaRole = authData.user.user_metadata?.role || authData.user.app_metadata?.role;
      if (metaRole && ['admin', 'protokoler', 'tamu', 'dokumentasi'].includes(metaRole)) {
        role = metaRole;
      } else {
        const email = authData.user.email || '';
        if (email.startsWith('admin@')) {
          role = 'admin';
        } else if (email.startsWith('pimpinan@') || email.startsWith('tamu@')) {
          role = 'tamu';
        } else if (email.startsWith('dokumentasi@')) {
          role = 'dokumentasi';
        }
      }

      dbUser = await this.prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email || '',
          role: role as RoleEnum,
        },
        include: { protokoler: true },
      });
    }

    // Ensure User profile exists in database
    if (dbUser && !dbUser.protokoler) {
      let name = dbUser.role === 'admin' ? 'Administrator' : 'Staf';
      if (authData.user.user_metadata?.nama_lengkap) {
        name = authData.user.user_metadata.nama_lengkap;
      }
      const nim = dbUser.role === 'protokoler'
        ? (authData.user.user_metadata?.nim || `MHS-${authData.user.id.substring(0, 8)}`)
        : `${dbUser.role.toUpperCase()}-${authData.user.id.substring(0, 8)}`;
      
      try {
        const newProfile = await this.prisma.protokoler.create({
          data: {
            user_id: dbUser.id,
            nim: nim,
            nama_lengkap: name,
            prodi: dbUser.role === 'protokoler' ? 'Teknik Informatika' : 'Sistem Informasi',
            departemen: 'Teknik',
            fakultas: 'FT',
            no_hp: '08123456789',
            status_akun: 'aktif',
          },
        });
        dbUser.protokoler = newProfile;
      } catch (e) {
        // Fallback to avoid nim collision
        const fallbackNim = `${dbUser.role.toUpperCase()}-${Date.now().toString().slice(-8)}`;
        const newProfile = await this.prisma.protokoler.create({
          data: {
            user_id: dbUser.id,
            nim: fallbackNim,
            nama_lengkap: name,
            prodi: dbUser.role === 'protokoler' ? 'Teknik Informatika' : 'Sistem Informasi',
            departemen: 'Teknik',
            fakultas: 'FT',
            no_hp: '08123456789',
            status_akun: 'aktif',
          },
        });
        dbUser.protokoler = newProfile;
      }
    }

    return {
      access_token: authData.session.access_token,
      token_type: 'Bearer',
      expires_in: authData.session.expires_in,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        nama_lengkap: dbUser.protokoler?.nama_lengkap || 'Administrator',
        avatar_url: dbUser.protokoler?.foto_setengah_badan_url || null,
        foto_setengah_badan_url: dbUser.protokoler?.foto_setengah_badan_url || null,
      },
    };
  }
}
