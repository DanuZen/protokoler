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
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Req() req: any, @Body('password') password: string) {
    return this.authService.resetPassword(req.user.id, password);
  }
}

