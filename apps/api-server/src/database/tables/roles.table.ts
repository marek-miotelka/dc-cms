import { Knex } from 'knex';
import { Logger } from '@nestjs/common';

export class RolesTable {
  private readonly logger = new Logger(RolesTable.name);

  constructor(
    private readonly knex: Knex,
    private readonly dbClient: string,
  ) {}

  async createTable(): Promise<void> {
    try {
      const hasTable = await this.knex.schema.hasTable('roles');

      if (!hasTable) {
        this.logger.log('Creating roles table...');
        await this.knex.schema.createTable('roles', (table) => {
          this.addColumns(table);
          this.addBaseIndexes(table);
        });

        await this.createUserRolesTable();
        this.logger.log('Roles tables created successfully');
      }
    } catch (error) {
      this.logger.error('Failed to create roles table:', error.stack);
      throw error;
    }
  }

  private addColumns(table: Knex.CreateTableBuilder): void {
    table.increments('id').primary();
    table.uuid('documentId').notNullable().unique();
    table.string('name').notNullable().unique();
    table.string('description').notNullable();
    table.jsonb('permissions').notNullable();
    table.timestamp('createdAt').notNullable().defaultTo(this.knex.fn.now());
    table.timestamp('updatedAt').notNullable().defaultTo(this.knex.fn.now());
  }

  private addBaseIndexes(table: Knex.CreateTableBuilder): void {
    table.index('name');
  }

  private async createUserRolesTable(): Promise<void> {
    const hasTable = await this.knex.schema.hasTable('user_roles');

    if (!hasTable) {
      this.logger.log('Creating user_roles table...');
      await this.knex.schema.createTable('user_roles', (table) => {
        table.increments('id').primary();
        table.integer('userId').unsigned().notNullable();
        table.integer('roleId').unsigned().notNullable();
        table
          .timestamp('createdAt')
          .notNullable()
          .defaultTo(this.knex.fn.now());
        table
          .timestamp('updatedAt')
          .notNullable()
          .defaultTo(this.knex.fn.now());

        table
          .foreign('userId')
          .references('id')
          .inTable('users')
          .onDelete('CASCADE');
        table
          .foreign('roleId')
          .references('id')
          .inTable('roles')
          .onDelete('CASCADE');

        table.unique(['userId', 'roleId']);
      });
    }
  }

  async dropTable(): Promise<void> {
    await this.knex.schema.dropTableIfExists('user_roles');
    await this.knex.schema.dropTableIfExists('roles');
  }
}
