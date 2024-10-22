import {
  Controller,
  Inject,
  Post,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE, VERIFY, VerifyEmailOrPhone } from '@sergo/shared';
import { lastValueFrom } from 'rxjs';

@Controller('verify')
export class VerifyController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @Post('/email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() data: VerifyEmailOrPhone) {
    const response = await lastValueFrom(
      this.authClient.send<VerifyEmailOrPhone>(VERIFY.VERIFY_EMAIL, {
        ...data,
      }),
    );
    return response;
  }
  @Post('/phone')
  @HttpCode(HttpStatus.OK)
  async verifyPhone(@Body() data: VerifyEmailOrPhone) {
    const response = await lastValueFrom(
      this.authClient.send<VerifyEmailOrPhone>(VERIFY.VERIFY_PHONE, {
        ...data,
      }),
    );
    return response;
  }
  @Post('/resend/phone-otp')
  async resendPhoneOtp(@Body('userId') userId: string) {
    const response = await lastValueFrom(
      this.authClient.send(VERIFY.RESEND_PHONE_OTP, {
        userId,
      }),
    );
    return response;
  }
  @Post('/resend/email-otp')
  async resendEmailOtp(@Body('userId') userId: string) {
    const response = await lastValueFrom(
      this.authClient.send(VERIFY.RESEND_EMAIL_OTP, {
        userId,
      }),
    );
    return response;
  }
}
