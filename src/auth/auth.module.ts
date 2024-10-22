import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  controllers: [AuthController],
  imports: [PassportModule, SharedModule],
  providers: [AuthService, LocalStrategy, JwtRefreshStrategy, JwtStrategy],
})
export class AuthModule {}
