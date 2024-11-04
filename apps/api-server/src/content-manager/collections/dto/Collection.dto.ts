import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '../models/Collection.model';

export class CollectionFieldDto {
  @ApiProperty({
    example: 'title',
    description: 'Field name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'string',
    description: 'Field type',
    enum: ['string', 'longtext', 'boolean', 'number', 'integer', 'date'],
  })
  @IsEnum(['string', 'longtext', 'boolean', 'number', 'integer', 'date'])
  type: FieldType;

  @ApiProperty({
    example: true,
    description: 'Whether the field is required',
  })
  @IsBoolean()
  required: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the field value must be unique',
  })
  @IsBoolean()
  unique: boolean;

  @ApiProperty({
    example: 'The title of the post',
    description: 'Field description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

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
    description: 'Collection slug (URL-friendly name)',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

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
