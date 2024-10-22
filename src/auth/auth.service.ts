import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  async generateCookies(
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
}
