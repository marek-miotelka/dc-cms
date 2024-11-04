import { Module } from '@nestjs/common';
import { AdminUsersService } from './users.service';
import { DatabaseModule } from '@api-server/database/database.module';

@Module({
  imports: [DatabaseModule],
  exports: [AdminUsersService],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
