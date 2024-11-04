import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ProvidersModule } from './providers/providers.module';
import { AuthJwtModule } from '@api-server/auth/jwt/jwt.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [AuthJwtModule, ProvidersModule],
})
export class AuthModule {}
