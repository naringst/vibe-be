import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { LoginDto, RefreshDto, SignupDto } from './auth.dto.js';
import { AuthGuard, CurrentUser } from './auth.guard.js';
import { AuthService, toPublicUser } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User) {
    return toPublicUser(user);
  }
}
