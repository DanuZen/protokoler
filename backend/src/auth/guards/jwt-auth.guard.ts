import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }

    const supabase = this.supabaseService.getClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }

    // Fetch user role from database
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { protokoler: true },
    });

    if (!dbUser) {
      throw new UnauthorizedException('Akun tidak terdaftar di database sistem');
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
