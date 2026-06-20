import { Injectable, ConflictException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
    const dbUser = await this.prisma.user.findUnique({
      where: { id: authData.user.id },
      include: { protokoler: true },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Akun tidak terdaftar di database sistem');
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
      },
    };
  }
}
