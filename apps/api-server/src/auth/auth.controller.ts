import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@api-server/auth/jwt/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from './decorators/auth-user.decorator';
import { AuthJwtUser } from './jwt/models/AuthJwt.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: 'Verify authentication status' })
  @ApiResponse({
    status: 200,
    description: 'User is authenticated',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            username: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  verifyAuth(@AuthUser() user: AuthJwtUser) {
    return {
      success: true,
      user,
    };
  }
}
