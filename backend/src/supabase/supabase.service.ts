import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly url: string;
  private readonly secretKey: string;
  /** secret key 클라이언트: RLS를 우회하므로 항상 user_id로 직접 필터링해야 한다. */
  readonly admin: SupabaseClient;

  constructor(config: ConfigService) {
    this.url = config.getOrThrow<string>('SUPABASE_URL');
    this.secretKey = config.getOrThrow<string>('SUPABASE_SECRET_KEY');
    this.admin = this.createClient();
  }

  /** 로그인처럼 세션이 생기는 작업용. 요청마다 새로 만들어 세션이 섞이지 않게 한다. */
  createClient(): SupabaseClient {
    return createClient(this.url, this.secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}
