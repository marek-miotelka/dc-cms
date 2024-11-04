import { Module } from '@nestjs/common';
import { AuthJwtService } from './jwt.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthJwtStrategy } from '@api-server/auth/jwt/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthJwtService, AuthJwtStrategy],
  exports: [AuthJwtService],
})
export class AuthJwtModule {}
