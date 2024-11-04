import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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

/**
 * Controller handling article-related HTTP requests
 * All routes require JWT authentication
 */
@ApiTags('articles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  /**
   * Creates a new article
   * @param createArticleDto - The article data to create
   * @returns Promise resolving to the created article
   */
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

  /**
   * Retrieves all articles
   * @returns Promise resolving to an array of articles
   */
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

  /**
   * Retrieves a specific article by ID
   * @param id - The ID of the article to retrieve
   * @returns Promise resolving to the found article
   * @throws NotFoundException if article is not found
   */
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found article',
    type: CreateArticleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ArticleFields> {
    return this.articlesService.findById(id);
  }

  /**
   * Updates an existing article
   * @param id - The ID of the article to update
   * @param updateArticleDto - The updated article data
   * @returns Promise resolving to the updated article
   * @throws NotFoundException if article is not found
   */
  @ApiOperation({ summary: 'Update article by ID' })
  @ApiResponse({
    status: 200,
    description: 'The article has been successfully updated',
    type: UpdateArticleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleFields> {
    return this.articlesService.update(id, updateArticleDto);
  }

  /**
   * Deletes an article
   * @param id - The ID of the article to delete
   * @throws NotFoundException if article is not found
   */
  @ApiOperation({ summary: 'Delete article by ID' })
  @ApiResponse({
    status: 204,
    description: 'The article has been successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Article not found',
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.articlesService.delete(id);
  }
}
