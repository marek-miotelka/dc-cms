import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthJwtUser,
  AuthSignJwtResponse,
} from '@api-server/auth/jwt/models/AuthJwt.model';

@Injectable()
export class AuthJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async sign(user: AuthJwtUser): Promise<AuthSignJwtResponse> {
    const accessToken = this.jwtService.sign({ user }, {});

    const accessTokenData = this.jwtService.decode(accessToken);

    return {
      accessToken: this.jwtService.sign({ user }),
      expiresAt: accessTokenData.exp,
      user,
    };
  }
}
