import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'editor',
    description: 'Role name',
    required: true,
  })
  @IsNotEmpty({ message: 'Role name is required' })
  @IsString({ message: 'Role name must be a string' })
  name: string;

  @ApiProperty({
    example: 'Can edit and publish content',
    description: 'Role description',
    required: true,
  })
  @IsNotEmpty({ message: 'Role description is required' })
  @IsString({ message: 'Role description must be a string' })
  description: string;

  @ApiProperty({
    example: ['create:articles', 'edit:articles', 'publish:articles'],
    description: 'List of permissions assigned to the role',
    required: true,
  })
  @IsArray({ message: 'Permissions must be an array' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  permissions: string[];
}

export class UpdateRoleDto extends CreateRoleDto {}
