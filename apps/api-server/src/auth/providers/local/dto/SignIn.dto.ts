import { IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInPayloadDto {
  @ApiProperty({ 
    example: 'john@example.com', 
    description: 'Email address or username for authentication' 
  })
  @IsString()
  identifier: string;

  @ApiProperty({ 
    example: 'Test1234#', 
    description: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character' 
  })
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minLowercase: 1,
  })
  password: string;
}