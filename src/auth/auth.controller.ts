import { Body, Controller, Get, Inject, Logger, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Get()
  async getUsers() {
    try {
      const user = this.authClient.send('get.users', {});

      return user;
    } catch (error) {
      this.logger.error('Error occurred while fetching user:', error);
      console.log('Full Error Details:', error);
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
    return this.authClient.send('auth.login', { ...data });
  }
}
