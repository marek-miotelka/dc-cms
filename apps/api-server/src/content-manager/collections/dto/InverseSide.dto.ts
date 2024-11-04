import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InverseSideConfigDto {
  @ApiProperty({
    example: 'posts',
    description: 'Field name on the inverse side',
  })
  @IsString()
  @IsNotEmpty()
  field: string;

  @ApiProperty({
    example: 'title',
    description: 'Field to display when showing related items',
  })
  @IsString()
  @IsNotEmpty()
  displayField: string;
}
