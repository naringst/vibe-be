import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { AuthGuard, CurrentUser } from '../auth/auth.guard.js';
import { MenusService } from './menus.service.js';

class CreateMenuDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30, { message: '메뉴 이름은 30자 이하로 입력해주세요.' })
  name!: string;
}

@Controller('menus')
@UseGuards(AuthGuard)
export class MenusController {
  constructor(private readonly menus: MenusService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.menus.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateMenuDto) {
    return this.menus.create(user.id, dto.name);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.menus.remove(user.id, id);
  }
}
