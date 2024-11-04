import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthJwtUser } from '@api-server/auth/jwt/models/AuthJwt.model';

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(ConfigService) protected readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.SECRET'),
    });
  }

  async validate(payload: { iat: number; exp: number; user: AuthJwtUser }) {
    // TODO: attach user to payload, more: https://docs.nestjs.com/recipes/passport#implementing-passport-jwt
    console.log('JWT VALIDATE PAYLOAD', payload);

    return payload.user;
  }
}
