import { Knex } from 'knex';
import { BaseTable } from './base.table';

export class RolesTable extends BaseTable {
  constructor(knex: Knex, dbClient: string) {
    super(knex, dbClient, 'roles');
  }

  async createTable(): Promise<void> {
    await this.createTableIfNotExists('roles', (table) => {
      this.addColumns(table);
      this.addBaseIndexes(table);
    });

    await this.createUserRolesTable();
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
    await this.createTableIfNotExists('user_roles', (table) => {
      table.increments('id').primary();
      table.integer('userId').unsigned().notNullable();
      table.integer('roleId').unsigned().notNullable();
      table.timestamp('createdAt').notNullable().defaultTo(this.knex.fn.now());
      table.timestamp('updatedAt').notNullable().defaultTo(this.knex.fn.now());

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

  async dropTable(): Promise<void> {
    await this.knex.schema.dropTableIfExists('user_roles');
    await this.knex.schema.dropTableIfExists('roles');
  }
}
