import { Injectable } from '@nestjs/common';
import { AuthJwtService } from '@api-server/auth/jwt/jwt.service';
import { AdminUsersService } from '@api-server/admin/users/users.service';
import {
  AuthJwtUser,
  AuthSignJwtResponse,
} from '@api-server/auth/jwt/models/AuthJwt.model';
import { GoogleProfile } from './models/GoogleProfile.model';

@Injectable()
export class GoogleStrategyService {
  constructor(
    private readonly authJwtService: AuthJwtService,
    private readonly usersService: AdminUsersService,
  ) {}

  async findOrCreateFromGoogle(profile: GoogleProfile) {
    const email = profile.emails[0]?.value;

    // First try to find user by Google provider ID
    let user = await this.usersService.findByProvider('google', profile.id);

    // If not found by provider ID, try to find by email
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
        name: profile.name.givenName,
        lastname: profile.name.familyName,
        providerIds: {
          google: profile.id,
        },
      });
    }

    return user;
  }

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

  async signIn(user: AuthJwtUser): Promise<AuthSignJwtResponse> {
    return this.authJwtService.sign(user);
  }
}
