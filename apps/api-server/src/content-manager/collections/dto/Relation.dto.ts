import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationType } from '../models/Collection.model';
import { InverseSideConfigDto } from './InverseSide.dto';

export class RelationConfigDto {
  @ApiProperty({
    enum: ['oneToOne', 'oneToMany', 'manyToMany'],
    description: 'Type of relation',
  })
  @IsEnum(['oneToOne', 'oneToMany', 'manyToMany'])
  type: RelationType;

  @ApiProperty({
    example: 'categories',
    description: 'Target collection slug',
  })
  @IsString()
  @IsNotEmpty()
  target: string;

  @ApiProperty({
    example: true,
    description: 'Whether the relation is bidirectional',
  })
  @IsBoolean()
  bidirectional: boolean;

  @ApiProperty({
    description: 'Configuration for the inverse side of the relation',
    required: false,
  })
  @ValidateIf((o) => o.bidirectional)
  @IsObject()
  @ValidateNested()
  @Type(() => InverseSideConfigDto)
  inverseSide?: InverseSideConfigDto;
}
