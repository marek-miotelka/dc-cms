import { Knex } from 'knex';
import { BaseTable } from './base.table';

export class CollectionsTable extends BaseTable {
  constructor(knex: Knex, dbClient: string) {
    super(knex, dbClient, 'collections');
  }

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
      } else {
        // Check if parentId column exists and add it if it doesn't
        const hasParentId = await this.knex.schema.hasColumn(
          'collections',
          'parentId',
        );
        if (!hasParentId) {
          this.logger.log('Adding parentId column to collections table...');
          await this.knex.schema.alterTable('collections', (table) => {
            table.integer('parentId').unsigned().nullable();
            table
              .foreign('parentId')
              .references('id')
              .inTable('collections')
              .onDelete('SET NULL');
          });
          this.logger.log('Added parentId column successfully');
        }
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
    table.integer('parentId').unsigned().nullable();
    table
      .foreign('parentId')
      .references('id')
      .inTable('collections')
      .onDelete('SET NULL');
    table.timestamp('createdAt').notNullable().defaultTo(this.knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(this.knex.fn.now());
  }

  private addBaseIndexes(table: Knex.CreateTableBuilder): void {
    table.index('slug');
    table.index('parentId');
  }

  async dropTable(): Promise<void> {
    await this.knex.schema.dropTableIfExists('collections');
  }
}
