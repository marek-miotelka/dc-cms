import { Module } from '@nestjs/common';
import { GoogleStrategyService } from './google.service';
import { GoogleStrategyController } from './google.controller';
import { GooglePassportStrategy } from './google.strategy';
import { AuthJwtModule } from '@api-server/auth/jwt/jwt.module';
import { AdminUsersModule } from '@api-server/admin/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ProviderService } from '@api-server/auth/providers/provider.service';

@Module({
  imports: [ConfigModule, AuthJwtModule, AdminUsersModule],
  providers: [GoogleStrategyService, GooglePassportStrategy, ProviderService],
  controllers: [GoogleStrategyController],
})
export class GoogleStrategyModule {}
