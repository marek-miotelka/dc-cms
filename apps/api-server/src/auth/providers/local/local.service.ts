import { Injectable, UnauthorizedException } from '@nestjs/common';
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

    if (!user?.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    return {
      documentId: user.documentId,
      email: user.email,
      username: user.username,
    };
  }

  async signIn(payload: AuthJwtUser): Promise<AuthSignJwtResponse> {
    return this.authJwtService.sign(payload);
  }
}
