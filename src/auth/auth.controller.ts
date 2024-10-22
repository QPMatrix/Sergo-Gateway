import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from '@sergo/shared/dtos/index';
import { AUTH_SERVICE, USERS, AUTH } from '@sergo/shared/constants/index';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponse } from './response/auth.response';
import { lastValueFrom } from 'rxjs';
import { CurrentUser } from '@sergo/shared/decorator/index';
import { LocalAuthGuard } from '../guards/local-auth.guard';
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly authService: AuthService,
  ) {}

  @Post('/signup')
  async signUp(@Body() data: CreateUserDto) {
    const user = this.authClient.send(USERS.CREATE_USER, {
      ...data,
    });
    return user;
  }
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResponse: AuthResponse = await lastValueFrom(
      this.authClient.send(AUTH.LOCAL_LOGIN, { ...user }),
    );
    await this.authService.generateCookies(
      authResponse.access_expire,
      authResponse.refresh_expire,
      authResponse.access_token,
      authResponse.refresh_token,
      res,
    );
    return {
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
    };
  }
  @Get('authenticate')
  me(@CurrentUser() user: any) {
    return user;
  }
}
