import { Injectable } from '@nestjs/common';
import { AuthJwtService } from '@api-server/auth/jwt/jwt.service';
import { AdminUsersService } from '@api-server/admin/users/users.service';
import {
  AuthJwtUser,
  AuthSignJwtResponse,
} from '@api-server/auth/jwt/models/AuthJwt.model';
import { GoogleProfile } from './models/GoogleProfile.model';

/**
 * Service handling Google OAuth2 authentication logic
 * Manages user creation, validation, and JWT token generation
 */
@Injectable()
export class GoogleStrategyService {
  constructor(
    private readonly authJwtService: AuthJwtService,
    private readonly usersService: AdminUsersService,
  ) {}

  /**
   * Find existing user or create new one from Google profile
   * Handles account linking and creation logic
   * @param profile - Google OAuth2 profile data
   */
  async findOrCreateFromGoogle(profile: GoogleProfile) {
    const email = profile.emails[0]?.value;

    // First try to find user by Google ID
    let user = await this.usersService.findByGoogleId(profile.id);

    // If not found by Google ID, try to find by email
    if (!user) {
      user = await this.usersService.findByEmail(email);

      // Security measure: Don't automatically link existing accounts
      // Prevents account takeover through email matching
      if (user) {
        return null;
      }
    }

    // Create new user if none exists
    if (!user) {
      user = await this.usersService.createUser({
        username: email.split('@')[0],
        email,
        googleId: profile.id,
        displayName: profile.displayName,
        photoUrl: profile.photos[0]?.value,
      });
    }

    return user;
  }

  /**
   * Validate Google user and prepare JWT payload
   * @param profile - Google OAuth2 profile
   * @returns JWT user payload
   */
  async validateUser(profile: GoogleProfile): Promise<AuthJwtUser> {
    const user = await this.findOrCreateFromGoogle(profile);

    if (!user) {
      throw new Error('Could not validate Google user');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  /**
   * Generate JWT token for authenticated Google user
   * @param user - Validated user data
   * @returns JWT token and user information
   */
  async signIn(user: AuthJwtUser): Promise<AuthSignJwtResponse> {
    return this.authJwtService.sign(user);
  }
}
