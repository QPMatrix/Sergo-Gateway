import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH, AUTH_SERVICE, TokenPayload } from '@sergo/shared';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  private readonly logger = new Logger(JwtRefreshStrategy.name); // Initialize Logger

  constructor(
    configService: ConfigService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Extract token from cookies or headers
          const token = request.cookies?.Refresh || request.headers?.refresh;

          return token;
        },
      ]),
      secretOrKey: configService.getOrThrow('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const token = request.headers?.refresh || request.cookies?.Refresh;

    if (!token) {
      this.logger.error('No refresh token found in the request');
      throw new BadRequestException('Refresh token is missing');
    }

    try {
      const response = await lastValueFrom(
        this.authClient.send(AUTH.VALIDATE_REFRESH_TOKEN, {
          token,
          userId: payload.userId,
        }),
      );

      return response;
    } catch (error) {
      this.logger.error('Error during refresh token validation', error.message);
      throw error;
    }
  }
}
