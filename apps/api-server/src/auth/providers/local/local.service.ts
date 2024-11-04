import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminUsersService } from '@api-server/admin/users/users.service';
import { AuthJwtService } from '@api-server/auth/jwt/jwt.service';
import { AuthJwtUser, AuthSignJwtResponse } from '@api-server/auth/jwt/models/AuthJwt.model';

/**
 * Service handling username/password authentication
 * Manages user validation and JWT token generation
 */
@Injectable()
export class LocalStrategyService {
  constructor(
    private usersService: AdminUsersService,
    private readonly authJwtService: AuthJwtService,
  ) {}

  /**
   * Validate user credentials
   * @param identifier - Username or email
   * @param password - User's password
   * @returns JWT user payload or null if validation fails
   */
  async validateUser(identifier: string, password: string): Promise<AuthJwtUser | null> {
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
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  /**
   * Generate JWT token for authenticated user
   * @param payload - Validated user data
   * @returns JWT token and user information
   */
  async signIn(payload: AuthJwtUser): Promise<AuthSignJwtResponse> {
    return this.authJwtService.sign(payload);
  }
}