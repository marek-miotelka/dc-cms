import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthJwtUser } from '../jwt/models/AuthJwt.model';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthJwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
