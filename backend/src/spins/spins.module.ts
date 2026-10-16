import { Module } from '@nestjs/common';
import { SpinsController } from './spins.controller.js';

@Module({ controllers: [SpinsController] })
export class SpinsModule {}
