import { v4 as uuidv4 } from 'uuid';
import { Knex } from 'knex';

export interface BaseModelFields {
  id: number;
  documentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseModelOptions {
  tableName: string;
  knex: Knex;
}

export abstract class BaseModel<T extends BaseModelFields> {
  protected tableName: string;
  protected knex: Knex;

  constructor(options: BaseModelOptions) {
    this.tableName = options.tableName;
    this.knex = options.knex;
  }

  protected getBaseFields(): Partial<BaseModelFields> {
    return {
      documentId: this.generateUuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  protected updateTimestamp(): Pick<BaseModelFields, 'updatedAt'> {
    return {
      updatedAt: new Date(),
    };
  }

  protected generateUuid(): string {
    return uuidv4();
  }

  async findById(id: number): Promise<T | null> {
    const result = await this.knex(this.tableName).where('id', id).first();
    return result || null;
  }

  async findByDocumentId(documentId: string): Promise<T | null> {
    const result = await this.knex(this.tableName)
      .where('documentId', documentId)
      .first();
    return result || null;
  }

  async create(data: Partial<T>): Promise<T> {
    const [id] = await this.knex(this.tableName)
      .insert({
        ...data,
        ...this.getBaseFields(),
      })
      .returning('id');

    const result = await this.findById(id);
    if (!result) {
      throw new Error('Failed to create record');
    }
    return result;
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    await this.knex(this.tableName)
      .where('id', id)
      .update({
        ...data,
        ...this.updateTimestamp(),
      });

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const count = await this.knex(this.tableName).where('id', id).delete();
    return count > 0;
  }

  protected query(): Knex.QueryBuilder {
    return this.knex(this.tableName);
  }

  abstract findAll(): Promise<T[]>;
}
