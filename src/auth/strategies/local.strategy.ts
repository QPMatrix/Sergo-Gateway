import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { AUTH_SERVICE, AUTH } from '@sergo/shared/constants/index';
import { Strategy } from 'passport-local';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {
    super({
      usernameField: 'identifier',
    });
  }
  async validate(identifier: string, password: string) {
    const user = lastValueFrom(
      this.authClient.send(AUTH.VALIDATE_USER, {
        identifier,
        password,
      }),
    );
    return user;
  }
}
