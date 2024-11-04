import { Module } from '@nestjs/common';
import { LocalStrategyService } from './local.service';
import { AdminUsersModule } from '@api-server/admin/users/users.module';
import { LocalStrategyController } from './local.controller';
import { LocalPassportStrategy } from '@api-server/auth/providers/local/local.strategy';
import { AuthJwtModule } from '@api-server/auth/jwt/jwt.module';

@Module({
  imports: [AuthJwtModule, AdminUsersModule],
  providers: [LocalStrategyService, LocalPassportStrategy],
  controllers: [LocalStrategyController],
})
export class LocalStrategyModule {}
