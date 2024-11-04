import { Injectable } from '@nestjs/common';
import { AdminUsersService } from '@api-server/admin/users/users.service';
import { AuthJwtService } from '@api-server/auth/jwt/jwt.service';
import {
  AuthJwtUser,
  AuthSignJwtResponse,
} from '@api-server/auth/jwt/models/AuthJwt.model';

@Injectable()
export class LocalStrategyService {
  constructor(
    private usersService: AdminUsersService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  async validateUser(
    identifier: string,
    password: string,
  ): Promise<AuthJwtUser | null> {
    const user = await this.usersService.findOne(identifier);

    if (user?.password !== password) {
      return null;
    }

    console.log('VALIDATE USER', user);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  async signIn(payload: AuthJwtUser): Promise<AuthSignJwtResponse> {
    return this.authJwtService.sign(payload);
  }
}
