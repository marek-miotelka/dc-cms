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
import { CreateCollectionDto, UpdateCollectionDto } from './dto/Collection.dto';
import { JwtAuthGuard } from '@api-server/auth/jwt/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CollectionFields } from './models/Collection.model';

@ApiTags('content-manager/collections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('content-manager/collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({
    status: 201,
    description: 'The collection has been successfully created',
    type: CreateCollectionDto,
  })
  @Post()
  async create(
    @Body() createCollectionDto: CreateCollectionDto,
  ): Promise<CollectionFields> {
    return this.collectionsService.create(createCollectionDto);
  }

  @ApiOperation({ summary: 'Get all collections' })
  @ApiResponse({
    status: 200,
    description: 'List of all collections',
    type: [CreateCollectionDto],
  })
  @Get()
  async findAll(): Promise<CollectionFields[]> {
    return this.collectionsService.findAll();
  }

  @ApiOperation({ summary: 'Get collection by documentId' })
  @ApiResponse({
    status: 200,
    description: 'The found collection',
    type: CreateCollectionDto,
  })
  @Get(':documentId')
  async findOne(
    @Param('documentId') documentId: string,
  ): Promise<CollectionFields> {
    return this.collectionsService.findByDocumentId(documentId);
  }

  @ApiOperation({ summary: 'Update collection by documentId' })
  @ApiResponse({
    status: 200,
    description: 'The collection has been successfully updated',
    type: UpdateCollectionDto,
  })
  @Put(':documentId')
  async update(
    @Param('documentId') documentId: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ): Promise<CollectionFields> {
    const collection =
      await this.collectionsService.findByDocumentId(documentId);
    return this.collectionsService.update(collection.id, updateCollectionDto);
  }

  @ApiOperation({ summary: 'Delete collection by documentId' })
  @ApiResponse({
    status: 204,
    description: 'The collection has been successfully deleted',
  })
  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('documentId') documentId: string): Promise<void> {
    const collection =
      await this.collectionsService.findByDocumentId(documentId);
    await this.collectionsService.delete(collection.id);
  }
}
