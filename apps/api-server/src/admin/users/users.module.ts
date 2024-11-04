import { Module } from '@nestjs/common';
import { DatabaseModule } from '@api-server/database/database.module';
import { AdminUsersController } from '@api-server/admin/users/users.controller';
import { AdminUsersService } from '@api-server/admin/users/users.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminUsersController],
  exports: [AdminUsersService],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
