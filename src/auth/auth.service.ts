import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { AuthResponse } from './response/auth.response';
import { UserWithRolesAndVerify, AUTH, AUTH_SERVICE } from '@sergo/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  private async generateCookies(
    accessExpire: string,
    refreshExpire: string,
    accessToken: string,
    refreshToken: string,
    res: Response,
  ) {
    // Convert the string dates to Date objects
    const accessExpireDate = new Date(accessExpire);
    const refreshExpireDate = new Date(refreshExpire);

    res.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: accessExpireDate,
    });
    res.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: refreshExpireDate,
    });
  }

  async handleAuthResponse(
    user: UserWithRolesAndVerify,
    res: Response,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const authResponse: AuthResponse = await lastValueFrom(
        this.authClient.send(AUTH.LOCAL_LOGIN, { ...user }),
      );
      await this.setAuthCookies(authResponse, res);

      return {
        access_token: authResponse.access_token,
        refresh_token: authResponse.refresh_token,
      };
    } catch (error) {
      this.logger.error('Error during authentication process', error);
      throw error;
    }
  }

  private async setAuthCookies(authResponse: AuthResponse, res: Response) {
    try {
      await this.generateCookies(
        authResponse.access_expire,
        authResponse.refresh_expire,
        authResponse.access_token,
        authResponse.refresh_token,
        res,
      );
    } catch (error) {
      this.logger.error('Error setting auth cookies', error);
      throw error;
    }
  }
}
