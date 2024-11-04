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

export class BaseModel {
  protected tableName: string;
  protected knex: Knex;

  constructor(options: BaseModelOptions) {
    this.tableName = options.tableName;
    this.knex = options.knex;
  }

  protected getBaseFields(): Partial<BaseModelFields> {
    return {
      documentId: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  protected updateTimestamp(): Pick<BaseModelFields, 'updatedAt'> {
    return {
      updatedAt: new Date(),
    };
  }

  async findById<T>(id: number): Promise<T | undefined> {
    return this.knex(this.tableName).where('id', id).first();
  }

  async findByDocumentId<T>(documentId: string): Promise<T | undefined> {
    return this.knex(this.tableName).where('documentId', documentId).first();
  }

  async create<T extends object>(data: Partial<T>): Promise<T> {
    const [id] = await this.knex(this.tableName)
      .insert({
        ...data,
        ...this.getBaseFields(),
      })
      .returning('id');

    return (await this.findById<T>(id)) as Promise<T>;
  }

  async update<T extends object>(
    id: number,
    data: Partial<T>,
  ): Promise<T | undefined> {
    await this.knex(this.tableName)
      .where('id', id)
      .update({
        ...data,
        ...this.updateTimestamp(),
      });

    return this.findById<T>(id);
  }

  async delete(id: number): Promise<boolean> {
    const count = await this.knex(this.tableName).where('id', id).delete();
    return count > 0;
  }

  protected query(): Knex.QueryBuilder {
    return this.knex(this.tableName);
  }
}
