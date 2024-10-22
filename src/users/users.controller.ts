import { Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AUTH_SERVICE,
  CurrentUser,
  UserWithRolesAndVerify,
} from '@sergo/shared';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@CurrentUser() user: UserWithRolesAndVerify) {
    return user;
  }
}
