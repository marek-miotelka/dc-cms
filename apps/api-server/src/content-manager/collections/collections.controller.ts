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
import { CreateCollectionDto, UpdateCollectionDto } from './dto/Collection.dto';
import { JwtAuthGuard } from '@api-server/auth/jwt/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CollectionFields } from './models/Collection.model';
import { CollectionHierarchyService } from './services/hierarchy.service';
import {
  ApiCreateCollection,
  ApiDeleteCollection,
  ApiGetCollection,
  ApiGetCollections,
  ApiGetSubcollections,
  ApiMoveCollection,
  ApiUpdateCollection,
} from './swagger.decorators';

@ApiTags('content-manager/collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('content-manager/collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly hierarchyService: CollectionHierarchyService,
  ) {}

  @Post()
  @ApiCreateCollection()
  async create(
    @Body() createCollectionDto: CreateCollectionDto,
  ): Promise<CollectionFields> {
    // If parentId is provided, validate and update the slug
    if (createCollectionDto.parentId !== undefined) {
      createCollectionDto.slug =
        await this.hierarchyService.validateHierarchicalSlug(
          createCollectionDto.parentId,
          createCollectionDto.slug,
        );
    }

    return this.collectionsService.create(createCollectionDto);
  }

  @Get()
  @ApiGetCollections()
  async findAll(
    @Query('hierarchical') hierarchical?: boolean,
  ): Promise<CollectionFields[]> {
    if (hierarchical) {
      return this.hierarchyService.getCollectionHierarchy();
    }
    return this.collectionsService.findAll();
  }

  @Get(':id/subcollections')
  @ApiGetSubcollections()
  async getSubcollections(
    @Param('id') id: string,
  ): Promise<CollectionFields[]> {
    return this.hierarchyService.getSubcollections(parseInt(id, 10));
  }

  @Put(':id/move')
  @ApiMoveCollection()
  async moveCollection(
    @Param('id') id: string,
    @Body('newParentId') newParentId: number | null,
  ): Promise<void> {
    await this.hierarchyService.moveCollection(parseInt(id, 10), newParentId);
  }

  @Get(':documentId')
  @ApiGetCollection()
  async findOne(
    @Param('documentId') documentId: string,
  ): Promise<CollectionFields> {
    return this.collectionsService.findByDocumentId(documentId);
  }

  @Put(':documentId')
  @ApiUpdateCollection()
  async update(
    @Param('documentId') documentId: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ): Promise<CollectionFields> {
    const collection =
      await this.collectionsService.findByDocumentId(documentId);
    return this.collectionsService.update(collection.id, updateCollectionDto);
  }

  @Delete(':documentId')
  @ApiDeleteCollection()
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('documentId') documentId: string): Promise<void> {
    const collection =
      await this.collectionsService.findByDocumentId(documentId);
    await this.collectionsService.delete(collection.id);
  }
}
