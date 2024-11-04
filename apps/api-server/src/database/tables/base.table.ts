import { Logger } from '@nestjs/common';
import { Knex } from 'knex';

export abstract class BaseTable {
  protected readonly logger: Logger;

  constructor(
    protected readonly knex: Knex,
    protected readonly dbClient: string,
    tableName: string,
  ) {
    this.logger = new Logger(`${tableName}Table`);
  }

  protected async createTableIfNotExists(
    tableName: string,
    createTable: (table: Knex.CreateTableBuilder) => void,
  ): Promise<void> {
    try {
      const exists = await this.knex.schema.hasTable(tableName);

      if (!exists) {
        this.logger.log(`Creating ${tableName} table...`);
        await this.knex.schema.createTable(tableName, createTable);
        this.logger.log(`${tableName} table created successfully`);
      } else {
        this.logger.log(`Table ${tableName} already exists, skipping creation`);
      }
    } catch (error) {
      this.logger.error(`Failed to create ${tableName} table:`, error.stack);
      throw error;
    }
  }

  protected async addColumnIfNotExists(
    tableName: string,
    columnName: string,
    addColumn: (table: Knex.AlterTableBuilder) => void,
  ): Promise<void> {
    try {
      const hasColumn = await this.knex.schema.hasColumn(tableName, columnName);

      if (!hasColumn) {
        this.logger.log(`Adding ${columnName} column to ${tableName} table...`);
        await this.knex.schema.alterTable(tableName, addColumn);
        this.logger.log(`Added ${columnName} column successfully`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to add ${columnName} column to ${tableName}:`,
        error.stack,
      );
      throw error;
    }
  }
}
