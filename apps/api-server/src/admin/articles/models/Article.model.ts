import { BaseModel, BaseModelFields } from '@api-server/database/base.model';

/**
 * Interface representing the fields of an Article entity
 * @extends BaseModelFields - Includes base fields like id, documentId, createdAt, updatedAt
 */
export interface ArticleFields extends BaseModelFields {
  /** The title or name of the article */
  name: string;
  /** The main content or description of the article */
  description: string;
}

/**
 * Model class for handling Article-specific database operations
 * @extends BaseModel - Provides base CRUD operations
 */
export class ArticleModel extends BaseModel {
  /**
   * Retrieves all articles from the database
   * @returns Promise resolving to an array of ArticleFields
   */
  async findAll(): Promise<ArticleFields[]> {
    return this.knex(this.tableName).select('*');
  }

  /**
   * Finds an article by its name
   * @param name - The name/title of the article to find
   * @returns Promise resolving to ArticleFields if found, null otherwise
   */
  async findByName(name: string): Promise<ArticleFields | null> {
    return this.knex(this.tableName).where('name', name).first();
  }
}
