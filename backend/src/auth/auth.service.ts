import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Session, User } from '@supabase/supabase-js';
import { MenusService } from '../menus/menus.service.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import { LoginDto, SignupDto } from './auth.dto.js';

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    nickname: (user.user_metadata?.nickname as string | undefined) ?? user.email?.split('@')[0],
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly menus: MenusService,
  ) {}

  async signup(dto: SignupDto) {
    // 관리자 API로 만들어서 이메일 인증 없이 바로 로그인할 수 있게 한다.
    const { data, error } = await this.supabase.admin.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: { nickname: dto.nickname?.trim() || dto.email.split('@')[0] },
    });
    if (error) {
      if (error.code === 'email_exists' || error.status === 422) {
        throw new ConflictException('이미 가입된 이메일이에요.');
      }
      throw new BadRequestException(error.message);
    }
    await this.menus.seedDefaults(data.user.id);
    return this.login(dto);
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase
      .createClient()
      .auth.signInWithPassword({ email: dto.email, password: dto.password });
    if (error || !data.session) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않아요.');
    }
    return this.toAuthResponse(data.session);
  }

  async refresh(refreshToken: string) {
    const { data, error } = await this.supabase
      .createClient()
      .auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session) {
      throw new UnauthorizedException('세션이 만료됐어요. 다시 로그인해주세요.');
    }
    return this.toAuthResponse(data.session);
  }

  private toAuthResponse(session: Session) {
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
      user: toPublicUser(session.user),
    };
  }
}
