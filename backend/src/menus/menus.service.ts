import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';

export const DEFAULT_MENUS = ['김치찌개', '제육볶음', '돈까스', '짜장면', '쌀국수', '초밥', '햄버거', '비빔밥'];
const MAX_MENUS = 16;

@Injectable()
export class MenusService {
  constructor(private readonly supabase: SupabaseService) {}

  private get table() {
    return this.supabase.admin.from('menus');
  }

  async list(userId: string) {
    const { data, error } = await this.table
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async create(userId: string, name: string) {
    const { count } = await this.table
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    if ((count ?? 0) >= MAX_MENUS) {
      throw new BadRequestException(`메뉴는 최대 ${MAX_MENUS}개까지 등록할 수 있어요.`);
    }
    const { data, error } = await this.table
      .insert({ user_id: userId, name: name.trim() })
      .select('id, name, created_at')
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  async remove(userId: string, id: string) {
    const { data, error } = await this.table
      .delete()
      .eq('user_id', userId)
      .eq('id', id)
      .select('id');
    if (error) throw new InternalServerErrorException(error.message);
    if (!data.length) throw new NotFoundException('메뉴를 찾을 수 없어요.');
  }

  async seedDefaults(userId: string) {
    const { error } = await this.table.insert(
      DEFAULT_MENUS.map((name) => ({ user_id: userId, name })),
    );
    if (error) throw new InternalServerErrorException(error.message);
  }
}
