import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Get()
  async getUser() {
    this.logger.log('Sending request to get-user...');

    try {
      const user = this.authClient.send('get-user', {
        name: 'hasan',
      });

      this.logger.log(
        `Received response from auth-service: ${JSON.stringify(user)}`,
      );
      return user;
    } catch (error) {
      this.logger.error('Error occurred while fetching user:', error);
      console.log('Full Error Details:', error);
      throw error; // Ensure we throw the error so it doesn't get swallowed.
    }
  }
}
