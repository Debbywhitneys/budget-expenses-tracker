// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../users/entities/user.entity';
import { DatabaseModule } from '../../database/database.module';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { AccessTokenGuard } from '../guards/access-token.guards';
import { RefreshTokenGuard } from '../guards/refresh-token.guards';
import { AccessStrategy } from './access.strategy';
import { RefreshStrategy } from './refresh.strategy';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthService,
    AccessTokenGuard,
    RefreshTokenGuard,
    AccessStrategy,
    RefreshStrategy,
  ],
  controllers: [AuthController],
  exports: [TypeOrmModule],
})
export class AuthModule {}
