import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import type { Request } from 'express';
import { SupabaseService } from '../supabase/supabase.service.js';

type AuthedRequest = Request & { user?: User };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('로그인이 필요해요.');
    }
    const { data, error } = await this.supabase.admin.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('세션이 만료됐어요. 다시 로그인해주세요.');
    }
    req.user = data.user;
    return true;
  }
}

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User =>
    ctx.switchToHttp().getRequest<AuthedRequest>().user!,
);
