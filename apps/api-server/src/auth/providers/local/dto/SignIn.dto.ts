import { IsString, IsStrongPassword } from 'class-validator';

export class SignInPayloadDto {
  @IsString()
  identifier: string;

  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minUppercase: 1,
    minLowercase: 1,
  })
  password: string;
}
