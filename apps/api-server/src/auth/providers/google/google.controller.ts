import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GoogleStrategyService } from './google.service';
import { GoogleAuthGuard } from './google.guard';
import {
  AuthJwtUser,
  AuthSignJwtResponse,
} from '@api-server/auth/jwt/models/AuthJwt.model';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createProviderGuard } from '../provider.guard';
import { AuthUser } from '../../decorators/auth-user.decorator';

const GoogleProviderGuard = createProviderGuard('google');

@ApiTags('auth/google')
@Controller('auth/providers/google')
@UseGuards(GoogleProviderGuard)
export class GoogleStrategyController {
  constructor(private readonly googleService: GoogleStrategyService) {}

  @ApiOperation({ summary: 'Initiate Google OAuth2 authentication' })
  @ApiResponse({
    status: 401,
    description: 'Google authentication is not enabled',
  })
  @Get()
  @UseGuards(GoogleAuthGuard)
  async googleAuth(): Promise<void> {
    // Guard redirects to Google
  }

  @ApiOperation({ summary: 'Handle Google OAuth2 callback' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated with Google',
    type: AuthSignJwtResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or Google authentication is not enabled',
  })
  @Get('callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @AuthUser() user: AuthJwtUser,
  ): Promise<AuthSignJwtResponse> {
    if (!user) {
      throw new UnauthorizedException('No user from Google');
    }
    return this.googleService.signIn(user);
  }
}
