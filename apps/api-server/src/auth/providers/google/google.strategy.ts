import { PassportStrategy } from '@nestjs/passport';
import {
  Profile,
  Strategy,
  StrategyOptionsWithRequest,
} from 'passport-google-oauth20';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { GoogleStrategyService } from './google.service';
import { GoogleProfile } from './models/GoogleProfile.model';
import { ProviderService } from '../provider.service';
import { AuthJwtUser } from '../../jwt/models/AuthJwt.model';

// Internal types for Google OAuth2 strategy
type OAuth2 = {
  _clientId: string;
  _clientSecret: string;
};

@Injectable()
export class GooglePassportStrategy
  extends PassportStrategy(Strategy, 'google')
  implements OnModuleInit
{
  constructor(
    private readonly providerService: ProviderService,
    private readonly googleService: GoogleStrategyService,
  ) {
    super({
      clientID: 'placeholder', // Will be set in onModuleInit
      clientSecret: 'placeholder', // Will be set in onModuleInit
      callbackURL: 'placeholder', // Will be set in onModuleInit
      scope: ['email', 'profile'],
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  async onModuleInit() {
    if (!this.providerService.isProviderEnabled('google')) {
      return;
    }

    const config = this.providerService.getProviderConfig<{
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      GOOGLE_CALLBACK_URL: string;
    }>('google');

    if (!config) {
      return;
    }

    // Access internal properties safely
    const strategy = this as unknown as {
      _strategy: Strategy & { oauth2: OAuth2; callbackURL: string };
    };

    // Update OAuth2 configuration
    strategy._strategy.oauth2._clientId = config.GOOGLE_CLIENT_ID;
    strategy._strategy.oauth2._clientSecret = config.GOOGLE_CLIENT_SECRET;
    strategy._strategy.callbackURL = config.GOOGLE_CALLBACK_URL;
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<AuthJwtUser> {
    const googleProfile: GoogleProfile = {
      id: profile.id,
      displayName: profile.displayName,
      name: {
        givenName: profile.name?.givenName || '',
        familyName: profile.name?.familyName || '',
      },
      emails: profile.emails || [],
      photos: profile.photos || [],
      provider: profile.provider,
    };

    return this.googleService.validateUser(googleProfile);
  }
}
