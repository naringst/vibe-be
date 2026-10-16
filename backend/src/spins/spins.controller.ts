import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import { SupabaseService } from '../supabase/supabase.service.js';

class CreateSpinDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  menuName!: string;
}

@Controller('spins')
@UseGuards(AuthGuard)
export class SpinsController {
  constructor(private readonly supabase: SupabaseService) {}

  @Get()
  async recent(@CurrentUser() user: User) {
    const { data, error } = await this.supabase.admin
      .from('spins')
      .select('id, menu_name, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }

  @Post()
  async create(@CurrentUser() user: User, @Body() dto: CreateSpinDto) {
    const { data, error } = await this.supabase.admin
      .from('spins')
      .insert({ user_id: user.id, menu_name: dto.menuName })
      .select('id, menu_name, created_at')
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return data;
  }
}
