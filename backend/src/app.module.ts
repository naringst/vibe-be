import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { MenusModule } from './menus/menus.module.js';
import { SpinsModule } from './spins/spins.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    MenusModule,
    SpinsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
