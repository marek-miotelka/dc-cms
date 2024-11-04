import { Knex } from 'knex';
import { BaseTable } from './base.table';

export class UsersTable extends BaseTable {
  constructor(knex: Knex, dbClient: string) {
    super(knex, dbClient, 'users');
  }

  async createTable(): Promise<void> {
    await this.createTableIfNotExists('users', (table) => {
      this.addColumns(table);
      this.addBaseIndexes(table);
    });

    await this.addProviderIdsIndex();
  }

  private addColumns(table: Knex.CreateTableBuilder): void {
    table.increments('id').primary();
    table.uuid('documentId').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('username').notNullable().unique();
    table.string('name').notNullable();
    table.string('lastname').notNullable();
    table.string('password').nullable();
    table.jsonb('provider_ids').nullable();
    table.timestamp('createdAt').notNullable().defaultTo(this.knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(this.knex.fn.now());
  }

  private addBaseIndexes(table: Knex.CreateTableBuilder): void {
    table.index('email');
    table.index('username');
  }

  private async addProviderIdsIndex(): Promise<void> {
    if (this.dbClient === 'pg') {
      await this.knex.schema.raw(
        'CREATE INDEX IF NOT EXISTS provider_ids_gin_idx ON users USING gin (provider_ids)',
      );
    } else {
      await this.knex.schema.raw(
        'ALTER TABLE users ADD INDEX provider_ids_idx ((CAST(provider_ids AS CHAR(255))))',
      );
    }
  }

  async dropTable(): Promise<void> {
    await this.knex.schema.dropTableIfExists('users');
  }
}
