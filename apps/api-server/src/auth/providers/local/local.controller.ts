import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalStrategyService } from '@api-server/auth/providers/local/local.service';
import { LocalStrategyAuthGuard } from '@api-server/auth/providers/local/local.guard';
import {
  AuthJwtUser,
  AuthSignJwtResponse,
} from '@api-server/auth/jwt/models/AuthJwt.model';

@Controller('auth/providers/local')
export class LocalStrategyController {
  constructor(private readonly localService: LocalStrategyService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalStrategyAuthGuard)
  @Post()
  signIn(
    @Request() req: Request & { user: AuthJwtUser },
  ): Promise<AuthSignJwtResponse> {
    return this.localService.signIn(req.user);
  }
}
