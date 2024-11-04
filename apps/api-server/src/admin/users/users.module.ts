import { Module } from '@nestjs/common';
import { AdminUsersService } from './users.service';

@Module({
  exports: [AdminUsersService],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
