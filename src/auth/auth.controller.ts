import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ClientProxy, Ctx, RmqContext } from '@nestjs/microservices';
import { CreateUserDto, LoginDto } from '@sergo/shared';
import { AUTH_SERVICE } from '@sergo/shared/dist/constants';
import { AUTH, USERS } from '@sergo/shared/dist/constants/patterns';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthResponse } from './response/auth.response';
import { lastValueFrom } from 'rxjs';
import { CurrentUser } from '@sergo/shared/dist/decorator';
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getUsers() {
    try {
      const user = this.authClient.send(USERS.GET_ALL_USERS, {});

      return user;
    } catch (error) {
      this.logger.error('Error occurred while fetching user:', error);
      throw error;
    }
  }
  @Post('/signup')
  async signUp(@Body() data: CreateUserDto) {
    const user = this.authClient.send(USERS.CREATE_USER, {
      ...data,
    });
    return user;
  }
  @Post('/login')
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResponse: AuthResponse = await lastValueFrom(
      this.authClient.send<AuthResponse>(AUTH.LOCAL_LOGIN, data),
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
  me(@Ctx() ctx: RmqContext) {
    console.log(ctx);
    //@ts-ignore
    return ctx.user;
  }
}
