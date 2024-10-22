import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { AUTH_SERVICE } from '@sergo/shared/dist/constants';
import { AUTH } from '@sergo/shared/dist/constants/patterns';
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
      this.authClient.send(AUTH.LOCAL_LOGIN, {
        identifier,
        password,
      }),
    );
    return user;
  }
}
