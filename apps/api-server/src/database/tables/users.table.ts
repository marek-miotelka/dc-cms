import { Knex } from 'knex';
import { Logger } from '@nestjs/common';

export class UsersTable {
  private readonly logger = new Logger(UsersTable.name);

  constructor(
    private readonly knex: Knex,
    private readonly dbClient: string,
  ) {}

  async createTable(): Promise<void> {
    try {
      const hasTable = await this.knex.schema.hasTable('users');

      if (!hasTable) {
        this.logger.log('Creating users table...');
        await this.knex.schema.createTable('users', (table) => {
          this.addColumns(table);
          this.addBaseIndexes(table);
        });

        await this.addClientSpecificIndexes();
        this.logger.log('Users table created successfully');
      }
    } catch (error) {
      this.logger.error('Failed to create users table:', error.stack);
      throw error;
    }
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

  private async addClientSpecificIndexes(): Promise<void> {
    if (this.dbClient === 'pg') {
      await this.knex.schema.raw(
        'CREATE INDEX provider_ids_gin_idx ON users USING gin (provider_ids)',
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
