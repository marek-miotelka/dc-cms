import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a new article
 * Validates and documents the required fields
 */
export class CreateArticleDto {
  @ApiProperty({
    example: 'Getting Started with NestJS',
    description: 'The name of the article',
    required: true,
  })
  @IsNotEmpty({ message: 'Article name is required' })
  @IsString({ message: 'Article name must be a string' })
  name: string;

  @ApiProperty({
    example: 'A comprehensive guide to building applications with NestJS...',
    description: 'The content of the article',
    required: true,
  })
  @IsNotEmpty({ message: 'Article description is required' })
  @IsString({ message: 'Article description must be a string' })
  description: string;
}

/**
 * Data Transfer Object for updating an existing article
 * Extends CreateArticleDto to maintain the same validation rules
 */
export class UpdateArticleDto extends CreateArticleDto {}
