import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RoleEnum } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }


    const supabase = this.supabaseService.getClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }

    // Fetch user role from database
    let dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { protokoler: true },
    });

    if (!dbUser) {
      // Clean up stale user record with same email to avoid unique constraint issues
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email: user.email || '' },
      });

      if (existingUserByEmail) {
        await this.prisma.user.delete({
          where: { id: existingUserByEmail.id }
        });
      }

      // Auto-provision user in database
      let role = 'protokoler';
      const metaRole = user.user_metadata?.role || user.app_metadata?.role;
      if (metaRole && ['admin', 'protokoler', 'tamu', 'dokumentasi'].includes(metaRole)) {
        role = metaRole;
      } else {
        const email = user.email || '';
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
          id: user.id,
          email: user.email || '',
          role: role as RoleEnum,
        },
        include: { protokoler: true },
      });
    }

    // Ensure User profile exists in database
    if (dbUser && !dbUser.protokoler) {
      let name = dbUser.role === 'admin' ? 'Administrator' : 'Staf';
      if (user.user_metadata?.nama_lengkap) {
        name = user.user_metadata.nama_lengkap;
      }
      const nim = dbUser.role === 'protokoler'
        ? (user.user_metadata?.nim || `MHS-${user.id.substring(0, 8)}`)
        : `${dbUser.role.toUpperCase()}-${user.id.substring(0, 8)}`;
      
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

    // Attach user information to request object
    request.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      nama_lengkap: dbUser.protokoler?.nama_lengkap || 'Administrator',
      protokolerId: dbUser.protokoler?.id || null,
      avatar_url: dbUser.protokoler?.foto_setengah_badan_url || null,
      foto_setengah_badan_url: dbUser.protokoler?.foto_setengah_badan_url || null,
    };

    return true;
  }
}
