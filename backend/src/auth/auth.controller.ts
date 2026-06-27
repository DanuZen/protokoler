import { Controller, Post, Body, UseInterceptors, UploadedFiles, HttpCode, HttpStatus, Get, UseGuards, Req, Patch } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'foto_setengah_badan', maxCount: 1 },
      { name: 'foto_full_body', maxCount: 1 },
    ]),
  )
  async register(
    @Body() dto: RegisterDto,
    @UploadedFiles() files: { foto_setengah_badan?: any[]; foto_full_body?: any[] },
  ) {
    return this.authService.register(dto, files);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Logout berhasil' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return req.user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Req() req: any, @Body('email') email: string) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const xForwardedHost = req.headers['x-forwarded-host'];
    const xForwardedProto = req.headers['x-forwarded-proto'] || 'http';

    let frontendUrl = origin;

    if (xForwardedHost) {
      // Reconstruct URL from x-forwarded-host and x-forwarded-proto when proxied by Next.js server
      frontendUrl = `${xForwardedProto}://${xForwardedHost}`;
    } else if (!frontendUrl && referer) {
      try {
        const parsedUrl = new URL(referer);
        frontendUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
      } catch (e) {
        // ignore
      }
    }

    console.log('[Auth] Forgot password request headers:', {
      origin,
      referer,
      xForwardedHost,
      xForwardedProto,
      resolvedFrontendUrl: frontendUrl,
    });

    return this.authService.forgotPassword(email, frontendUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Req() req: any, @Body('password') password: string) {
    return this.authService.resetPassword(req.user.id, password);
  }
}

