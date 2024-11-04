import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ArticleFields, ArticleModel } from './models/Article.model';
import { CrudService } from '@api-server/database/crud.service';
import { Knex } from 'knex';

/**
 * Service handling article-related business logic and database operations
 * @extends CrudService<ArticleFields> - Provides base CRUD operations for articles
 * @implements OnModuleInit - Handles initialization of the article model
 */
@Injectable()
export class AdminArticlesService
  extends CrudService<ArticleFields>
  implements OnModuleInit
{
  private articleModel: ArticleModel;

  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {
    super();
  }

  /**
   * Initializes the article model with database connection
   * Called automatically when the module is initialized
   */
  onModuleInit() {
    this.articleModel = new ArticleModel({
      tableName: 'articles',
      knex: this.knex,
    });
    this.setModel(this.articleModel);
  }

  /**
   * Retrieves all articles from the database
   * @returns Promise resolving to an array of articles
   */
  async findAll(): Promise<ArticleFields[]> {
    return this.articleModel.findAll();
  }

  /**
   * Finds an article by its name
   * @param name - The name/title of the article to find
   * @returns Promise resolving to the found article or null
   */
  async findByName(name: string): Promise<ArticleFields | null> {
    return this.articleModel.findByName(name);
  }
}
