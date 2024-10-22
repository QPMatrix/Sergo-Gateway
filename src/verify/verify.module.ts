import { Module } from '@nestjs/common';
import { VerifyController } from './verify.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  controllers: [VerifyController],
  providers: [],
  imports: [SharedModule],
})
export class VerifyModule {}
