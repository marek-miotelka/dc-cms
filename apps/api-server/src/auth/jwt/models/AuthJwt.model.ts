import { ApiProperty } from '@nestjs/swagger';

export class AuthJwtUser {
  @ApiProperty({ example: 1, description: 'Unique identifier of the user' })
  id: number;

  @ApiProperty({ example: 'john@example.com', description: 'Email address of the user' })
  email: string;

  @ApiProperty({ example: 'john', description: 'Username of the user' })
  username: string;
}

export class AuthSignJwtResponse {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 
    description: 'JWT access token' 
  })
  accessToken: string;

  @ApiProperty({ 
    example: 1698512400, 
    description: 'Token expiration timestamp' 
  })
  expiresAt: number;

  @ApiProperty({ 
    description: 'Authenticated user information',
    type: AuthJwtUser 
  })
  user: AuthJwtUser;
}