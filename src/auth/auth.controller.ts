import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto, LoginDto } from '@sergo/shared';
import { AUTH_SERVICE } from '@sergo/shared/dist/constants';
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @Get()
  async getUsers() {
    try {
      const user = this.authClient.send('get.users', {});

      return user;
    } catch (error) {
      this.logger.error('Error occurred while fetching user:', error);
      throw error;
    }
  }
  @Post('/signup')
  async signUp(@Body() data: CreateUserDto) {
    const user = this.authClient.send('create.user', {
      ...data,
    });
    return user;
  }
  @Post('/login')
  async login(@Body() data: LoginDto) {
    const response = this.authClient.send('auth.local.login', { ...data });
    return response;
  }
}
