import { Module } from '@nestjs/common';
import { AdminUsersModule } from '@api-server/admin/users/users.module';
import { AdminArticlesModule } from '@api-server/admin/articles/articles.module';

@Module({
  imports: [AdminUsersModule, AdminArticlesModule],
  exports: [AdminUsersModule, AdminArticlesModule],
})
export class AdminModule {}
