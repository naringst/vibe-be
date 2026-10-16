import { Module } from '@nestjs/common';
import { MenusModule } from '../menus/menus.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [MenusModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
