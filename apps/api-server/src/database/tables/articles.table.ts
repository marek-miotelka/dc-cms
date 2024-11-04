import { Knex } from 'knex';
import { Logger } from '@nestjs/common';

export class ArticlesTable {
  private readonly logger = new Logger(ArticlesTable.name);

  constructor(
    private readonly knex: Knex,
    private readonly dbClient: string,
  ) {}

  async createTable(): Promise<void> {
    try {
      const hasTable = await this.knex.schema.hasTable('articles');

      if (!hasTable) {
        this.logger.log('Creating articles table...');
        await this.knex.schema.createTable('articles', (table) => {
          this.addColumns(table);
          this.addBaseIndexes(table);
        });

        this.logger.log('Articles table created successfully');
      }
    } catch (error) {
      this.logger.error('Failed to create articles table:', error.stack);
      throw error;
    }
  }

  private addColumns(table: Knex.CreateTableBuilder): void {
    table.increments('id').primary();
    table.uuid('documentId').notNullable().unique();
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(this.knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(this.knex.fn.now());
  }

  private addBaseIndexes(table: Knex.CreateTableBuilder): void {
    table.index('name');
  }

  async dropTable(): Promise<void> {
    await this.knex.schema.dropTableIfExists('articles');
  }
}
