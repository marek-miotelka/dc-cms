import { Module } from '@nestjs/common';
import { AdminUsersModule } from '@api-server/admin/users/users.module';
import { AdminRolesModule } from '@api-server/admin/roles/roles.module';

@Module({
  imports: [AdminUsersModule, AdminRolesModule],
  exports: [AdminUsersModule, AdminRolesModule],
})
export class AdminModule {}
