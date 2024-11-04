import { Knex } from 'knex';
import { Logger } from '@nestjs/common';

export class CollectionsTable {
  private readonly logger = new Logger(CollectionsTable.name);

  constructor(
    private readonly knex: Knex,
    private readonly dbClient: string,
  ) {}

  async createTable(): Promise<void> {
    try {
      const hasTable = await this.knex.schema.hasTable('collections');

      if (!hasTable) {
        this.logger.log('Creating collections table...');
        await this.knex.schema.createTable('collections', (table) => {
          this.addColumns(table);
          this.addBaseIndexes(table);
        });

        this.logger.log('Collections table created successfully');
      }
    } catch (error) {
      this.logger.error('Failed to create collections table:', error.stack);
      throw error;
    }
  }

  private addColumns(table: Knex.CreateTableBuilder): void {
    table.increments('id').primary();
    table.uuid('documentId').notNullable().unique();
    table.string('name').notNullable();
    table.string('slug').notNullable().unique();
    table.string('description').nullable();
    table.jsonb('fields').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(this.knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(this.knex.fn.now());
  }

  private addBaseIndexes(table: Knex.CreateTableBuilder): void {
    table.index('slug');
  }

  async dropTable(): Promise<void> {
    await this.knex.schema.dropTableIfExists('collections');
  }
}
