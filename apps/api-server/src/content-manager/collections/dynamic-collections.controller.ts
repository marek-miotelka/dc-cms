import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '@api-server/auth/jwt/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('dynamic-collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DynamicCollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @ApiOperation({ summary: 'Get all records from a collection' })
  @ApiResponse({
    status: 200,
    description: 'List of all records in the collection',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
  })
  @Get(':collectionSlug')
  async findAll(@Param('collectionSlug') slug: string): Promise<any[]> {
    return this.collectionsService.getCollectionData(slug);
  }

  @ApiOperation({ summary: 'Get a record by documentId' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection or record not found',
  })
  @Get(':collectionSlug/:documentId')
  async findOne(
    @Param('collectionSlug') slug: string,
    @Param('documentId') documentId: string,
  ): Promise<any> {
    return this.collectionsService.getCollectionRecord(slug, documentId);
  }

  @ApiOperation({ summary: 'Create a new record' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid field value or missing required field',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate value for unique field',
  })
  @Post(':collectionSlug')
  async create(
    @Param('collectionSlug') slug: string,
    @Body() createDto: any,
  ): Promise<any> {
    return this.collectionsService.createCollectionRecord(slug, createDto);
  }

  @ApiOperation({ summary: 'Update a record' })
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully updated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid field value',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection or record not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate value for unique field',
  })
  @Put(':collectionSlug/:documentId')
  async update(
    @Param('collectionSlug') slug: string,
    @Param('documentId') documentId: string,
    @Body() updateDto: any,
  ): Promise<any> {
    return this.collectionsService.updateCollectionRecord(
      slug,
      documentId,
      updateDto,
    );
  }

  @ApiOperation({ summary: 'Delete a record' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Collection or record not found',
  })
  @Delete(':collectionSlug/:documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('collectionSlug') slug: string,
    @Param('documentId') documentId: string,
  ): Promise<void> {
    await this.collectionsService.deleteCollectionRecord(slug, documentId);
  }
}
