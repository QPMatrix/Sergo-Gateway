import {
  Body,
  Controller,
  Post,
  Inject,
  Logger,
  Res,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import {
  UserWithRolesAndVerify,
  CurrentUser,
  AUTH_SERVICE,
  USERS,
  CreateUserDto,
} from '@sergo/shared';
import { lastValueFrom } from 'rxjs';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly authService: AuthService,
  ) {}
  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  async signUp(@Body() data: CreateUserDto) {
    try {
      const user = await lastValueFrom(
        this.authClient.send(USERS.CREATE_USER, { ...data }),
      );
      return user;
    } catch (error) {
      this.logger.error('Error during signup', error);
      throw error;
    }
  }
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: UserWithRolesAndVerify,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.handleAuthResponse(user, res);
  }
  @HttpCode(HttpStatus.OK)
  @Post('/refresh_token')
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: UserWithRolesAndVerify,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.handleAuthResponse(user, res);
  }
}
