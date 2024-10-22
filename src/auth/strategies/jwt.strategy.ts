import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE, USERS, TokenPayload } from '@sergo/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name); // Initialize Logger

  constructor(
    configService: ConfigService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Log the incoming request (careful about logging sensitive data like tokens in production)
          this.logger.debug('Extracting token from request...');
          this.logger.debug(
            `Request cookies: ${JSON.stringify(request.cookies)}`,
          );
          this.logger.debug(
            `Request headers: ${JSON.stringify(request.headers)}`,
          );

          // Extract token from cookies or headers
          const token =
            request.cookies?.Authentication || request.headers?.authentication;

          // Log the extracted token
          if (token) {
            this.logger.debug(`Token extracted: ${token}`);
          } else {
            this.logger.warn('No token found in request');
          }

          return token;
        },
      ]),
      secretOrKey: configService.getOrThrow('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    this.logger.debug(`JWT Payload: ${JSON.stringify(payload)}`);
    // Fetch the user from the microservice
    return this.authClient.send(USERS.GET_USER, {
      ...payload,
    });
  }
}
