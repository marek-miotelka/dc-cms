import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LocalStrategyService } from './local.service';
import { LocalStrategyAuthGuard } from './local.guard';
import {
  AuthJwtUser,
  AuthSignJwtResponse,
} from '@api-server/auth/jwt/models/AuthJwt.model';
import { SignInPayloadDto } from './dto/SignIn.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '../../decorators/auth-user.decorator';

@ApiTags('auth/local')
@Controller('auth/providers/local')
export class LocalStrategyController {
  constructor(private readonly localService: LocalStrategyService) {}

  @ApiOperation({ summary: 'Sign in with email/username and password' })
  @ApiResponse({
    status: 200,
    description: 'Successfully authenticated',
    type: AuthSignJwtResponse,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalStrategyAuthGuard)
  @Post()
  signIn(
    @Body() signInDto: SignInPayloadDto,
    @AuthUser() user: AuthJwtUser,
  ): Promise<AuthSignJwtResponse> {
    return this.localService.signIn(user);
  }
}
