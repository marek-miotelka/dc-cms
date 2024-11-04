import { Module } from '@nestjs/common';
import { AdminUsersModule } from '@api-server/admin/users/users.module';

@Module({
  imports: [AdminUsersModule],
  exports: [AdminUsersModule],
})
export class AdminModule {}
