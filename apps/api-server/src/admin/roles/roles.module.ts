import { Module } from '@nestjs/common';
import { AdminRolesService } from './roles.service';
import { AdminRolesController } from './roles.controller';
import { DatabaseModule } from '@api-server/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminRolesController],
  providers: [AdminRolesService],
  exports: [AdminRolesService],
})
export class AdminRolesModule {}
