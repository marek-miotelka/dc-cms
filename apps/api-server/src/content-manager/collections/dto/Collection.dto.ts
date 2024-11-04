import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CollectionFieldDto } from './CollectionField.dto';

export class CreateCollectionDto {
  @ApiProperty({
    example: 'Blog Posts',
    description: 'Collection name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'posts',
    description: 'Collection slug',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    example: 1,
    description: 'Parent collection ID for hierarchical collections',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @ApiProperty({
    example: 'Collection of blog posts',
    description: 'Collection description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: [CollectionFieldDto],
    description: 'Collection fields',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CollectionFieldDto)
  fields: CollectionFieldDto[];
}

export class UpdateCollectionDto extends CreateCollectionDto {}
