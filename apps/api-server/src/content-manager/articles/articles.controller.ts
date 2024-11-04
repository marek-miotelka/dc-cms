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
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto/Article.dto';
import { JwtAuthGuard } from '@api-server/auth/jwt/jwt.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ArticleFields } from './models/Article.model';

@ApiTags('articles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({
    status: 201,
    description: 'The article has been successfully created',
    type: CreateArticleDto,
  })
  @Post()
  async create(
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ArticleFields> {
    return this.articlesService.create(createArticleDto);
  }

  @ApiOperation({ summary: 'Get all articles' })
  @ApiResponse({
    status: 200,
    description: 'List of all articles',
    type: [CreateArticleDto],
  })
  @Get()
  async findAll(): Promise<ArticleFields[]> {
    return this.articlesService.findAll();
  }

  @ApiOperation({ summary: 'Get article by documentId' })
  @ApiResponse({
    status: 200,
    description: 'The found article',
    type: CreateArticleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @Get(':documentId')
  async findOne(
    @Param('documentId') documentId: string,
  ): Promise<ArticleFields> {
    return this.articlesService.findByDocumentId(documentId);
  }

  @ApiOperation({ summary: 'Update article by documentId' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully updated',
    type: UpdateArticleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @Put(':documentId')
  async update(
    @Param('documentId') documentId: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleFields> {
    const article = await this.articlesService.findByDocumentId(documentId);
    return this.articlesService.update(article.id, updateArticleDto);
  }

  @ApiOperation({ summary: 'Delete article by documentId' })
  @ApiResponse({
    status: 204,
    description: 'The article has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @Delete(':documentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('documentId') documentId: string): Promise<void> {
    const article = await this.articlesService.findByDocumentId(documentId);
    await this.articlesService.delete(article.id);
  }
}
