import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
    required: true,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    example: 'john',
    description: 'Username for the account',
    required: true,
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: true,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: true,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  lastname: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password (required for local authentication)',
    required: false,
  })
  @IsOptional()
  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minUppercase: 1,
      minLowercase: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and symbol',
    },
  )
  password?: string;

  @ApiProperty({
    example: ['role1-document-id', 'role2-document-id'],
    description: 'List of role document IDs to assign to the user',
    required: true,
  })
  @IsArray({ message: 'Roles must be an array' })
  @IsString({ each: true, message: 'Each role must be a string (documentId)' })
  @IsNotEmpty({ message: 'At least one role is required' })
  roleDocumentIds: string[];
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiProperty({
    example: 'john',
    description: 'Username for the account',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  username?: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  name?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastname?: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description: 'User password',
    required: false,
  })
  @IsOptional()
  @IsStrongPassword(
    {
      minLength: 8,
      minNumbers: 1,
      minUppercase: 1,
      minLowercase: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 8 characters, including uppercase, lowercase, number, and symbol',
    },
  )
  password?: string;

  @ApiProperty({
    example: ['role1-document-id', 'role2-document-id'],
    description: 'List of role document IDs to assign to the user',
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Roles must be an array' })
  @IsString({ each: true, message: 'Each role must be a string (documentId)' })
  roleDocumentIds?: string[];
}
