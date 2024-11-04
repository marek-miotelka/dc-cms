import { CanActivate, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthProvider, ProviderService } from './provider.service';

/**
 * Base guard for checking authentication provider availability
 * Prevents access to disabled authentication methods
 */
@Injectable()
export class ProviderGuard implements CanActivate {
  constructor(
    readonly providerService: ProviderService,
    readonly provider: AuthProvider,
  ) {}

  canActivate(): boolean {
    if (!this.providerService.isProviderEnabled(this.provider)) {
      throw new UnauthorizedException(
        `${this.provider} authentication is not enabled`,
      );
    }
    return true;
  }
}

/**
 * Factory function to create provider-specific guards
 * @param provider - The authentication provider to guard
 * @returns A guard class for the specified provider
 */
export function createProviderGuard(provider: AuthProvider) {
  @Injectable()
  class SpecificProviderGuard extends ProviderGuard {
    constructor(providerService: ProviderService) {
      super(providerService, provider);
    }
  }

  Object.defineProperty(SpecificProviderGuard, 'name', {
    value: `${provider.charAt(0).toUpperCase()}${provider.slice(1)}ProviderGuard`,
  });

  return SpecificProviderGuard;
}
