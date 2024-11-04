import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LocalStrategyService } from '@api-server/auth/providers/local/local.service';

@Injectable()
export class LocalPassportStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private localStrategyService: LocalStrategyService) {
    super({
      usernameField: 'identifier',
      passwordField: 'password',
    });
  }

  async validate(identifier: string, password: string): Promise<any> {
    const user = await this.localStrategyService.validateUser(
      identifier,
      password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
