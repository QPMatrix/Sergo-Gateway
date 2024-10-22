import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  controllers: [UsersController],
  providers: [],
  imports: [SharedModule],
})
export class UsersModule {}
