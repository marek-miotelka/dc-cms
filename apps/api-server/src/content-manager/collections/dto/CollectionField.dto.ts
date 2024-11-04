import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '../models/Collection.model';
import { RelationConfigDto } from './Relation.dto';

export class CollectionFieldDto {
  @ApiProperty({
    example: 'title',
    description: 'Field name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: [
      'string',
      'longtext',
      'boolean',
      'number',
      'integer',
      'date',
      'relation',
    ],
    description: 'Field type',
  })
  @IsEnum([
    'string',
    'longtext',
    'boolean',
    'number',
    'integer',
    'date',
    'relation',
  ])
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

  @ApiProperty({
    description: 'Relation configuration',
    required: false,
    type: RelationConfigDto,
  })
  @ValidateIf((o) => o.type === 'relation')
  @IsObject()
  @ValidateNested()
  @Type(() => RelationConfigDto)
  relation?: RelationConfigDto;
}
