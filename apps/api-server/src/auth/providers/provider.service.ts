import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleConfig } from '@api-server/config/providers.config';

/**
 * Supported authentication provider types
 */
export type AuthProvider = 'local' | 'google';

/**
 * Central service for managing authentication providers
 * Handles provider availability, configuration, and status checks
 */
@Injectable()
export class ProviderService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Check if a specific authentication provider is enabled
   * @param provider - The authentication provider to check
   * @returns boolean indicating if the provider is enabled
   */
  isProviderEnabled(provider: AuthProvider): boolean {
    switch (provider) {
      case 'local':
        return true; // Local auth is always enabled
      case 'google':
        const googleConfig =
          this.configService.get<GoogleConfig>('providers.google');
        return !!googleConfig?.enabled;
      default:
        return false;
    }
  }

  /**
   * Retrieve configuration for a specific provider
   * @param provider - The authentication provider
   * @returns Provider-specific configuration or null if not found
   */
  getProviderConfig<T>(provider: AuthProvider): T | null {
    switch (provider) {
      case 'google':
        const googleConfig =
          this.configService.get<GoogleConfig>('providers.google');
        return googleConfig?.config as T;
      default:
        return null;
    }
  }

  /**
   * Get a list of all currently enabled authentication providers
   * @returns Array of enabled provider identifiers
   */
  getEnabledProviders(): AuthProvider[] {
    const providers: AuthProvider[] = ['local'];

    if (this.isProviderEnabled('google')) {
      providers.push('google');
    }

    return providers;
  }
}
