import { BaseModel, BaseModelFields } from '@api-server/database/base.model';

export interface ArticleFields extends BaseModelFields {
  name: string;
  description: string;
}

export class ArticleModel extends BaseModel<ArticleFields> {
  async findAll(): Promise<ArticleFields[]> {
    return this.knex(this.tableName).select('*');
  }

  async findByName(name: string): Promise<ArticleFields | null> {
    const result = await this.knex(this.tableName).where('name', name).first();
    return result || null;
  }

  override async findById(id: number): Promise<ArticleFields | null> {
    return super.findById(id);
  }

  override async findByDocumentId(
    documentId: string,
  ): Promise<ArticleFields | null> {
    return super.findByDocumentId(documentId);
  }

  override async create(data: Partial<ArticleFields>): Promise<ArticleFields> {
    return super.create(data);
  }

  override async update(
    id: number,
    data: Partial<ArticleFields>,
  ): Promise<ArticleFields | null> {
    return super.update(id, data);
  }
}
