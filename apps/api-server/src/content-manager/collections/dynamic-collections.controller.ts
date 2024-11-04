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
  Query,
  UseGuards,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { JwtAuthGuard } from '@api-server/auth/jwt/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CollectionRecordsService } from './services/records.service';
import { CollectionNotFoundException } from './exceptions/collection.exceptions';
import {
  ApiCreateRecord,
  ApiDeleteRecord,
  ApiGetRecord,
  ApiGetRecords,
  ApiUpdateRecord,
} from './swagger.decorators';

@ApiTags('dynamic-collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DynamicCollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly recordsService: CollectionRecordsService,
  ) {}

  @Get(':collectionSlug')
  @ApiGetRecords()
  async findAll(
    @Param('collectionSlug') slug: string,
    @Query('includeRelations') includeRelations?: boolean,
  ): Promise<any[]> {
    const collection = await this.collectionsService.findBySlug(slug);
    if (!collection) {
      throw new CollectionNotFoundException(slug);
    }
    return this.recordsService.getCollectionRecords(
      collection,
      includeRelations,
    );
  }

  @Get(':collectionSlug/:documentId')
  @ApiGetRecord()
  async findOne(
    @Param('collectionSlug') slug: string,
    @Param('documentId') documentId: string,
    @Query('includeRelations') includeRelations?: boolean,
  ): Promise<any> {
    const collection = await this.collectionsService.findBySlug(slug);
    if (!collection) {
      throw new CollectionNotFoundException(slug);
    }
    return this.recordsService.getCollectionRecord(
      collection,
      documentId,
      includeRelations,
    );
  }

  @Post(':collectionSlug')
  @ApiCreateRecord()
  async create(
    @Param('collectionSlug') slug: string,
    @Body() createDto: { data: any; relations?: Record<string, string[]> },
  ): Promise<any> {
    const collection = await this.collectionsService.findBySlug(slug);
    if (!collection) {
      throw new CollectionNotFoundException(slug);
    }
    return this.recordsService.createCollectionRecord(collection, createDto);
  }

  @Put(':collectionSlug/:documentId')
  @ApiUpdateRecord()
  async update(
    @Param('collectionSlug') slug: string,
    @Param('documentId') documentId: string,
    @Body() updateDto: { data: any; relations?: Record<string, string[]> },
  ): Promise<any> {
    const collection = await this.collectionsService.findBySlug(slug);
    if (!collection) {
      throw new CollectionNotFoundException(slug);
    }
    return this.recordsService.updateCollectionRecord(
      collection,
      documentId,
      updateDto,
    );
  }

  @Delete(':collectionSlug/:documentId')
  @ApiDeleteRecord()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('collectionSlug') slug: string,
    @Param('documentId') documentId: string,
  ): Promise<void> {
    const collection = await this.collectionsService.findBySlug(slug);
    if (!collection) {
      throw new CollectionNotFoundException(slug);
    }
    await this.recordsService.deleteCollectionRecord(collection, documentId);
  }
}
