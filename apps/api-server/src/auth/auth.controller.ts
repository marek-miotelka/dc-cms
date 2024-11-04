import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@api-server/auth/jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  @UseGuards(JwtAuthGuard)
  @Get()
  getHello(@Req() req: any) {
    console.log(req.user);
    return {
      success: true,
    };
  }
}
