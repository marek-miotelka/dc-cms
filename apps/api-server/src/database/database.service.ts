import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Knex } from 'knex';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '@api-server/config/database.config';
import { tables } from './tables';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly dbClient: string;

  constructor(
    @Inject('KNEX_CONNECTION') private readonly knex: Knex,
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get<DatabaseConfig>('database');
    this.dbClient = config?.client || 'mysql2';
  }

  async onModuleInit() {
    await this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      this.logger.log('Checking database tables...');

      // Initialize tables in sequence to maintain dependencies
      const usersTable = new tables.UsersTable(this.knex, this.dbClient);
      const rolesTable = new tables.RolesTable(this.knex, this.dbClient);
      const collectionsTable = new tables.CollectionsTable(
        this.knex,
        this.dbClient,
      );

      // Create tables in order
      await this.createTableSafely('users', () => usersTable.createTable());
      await this.createTableSafely('roles', () => rolesTable.createTable());
      await this.createTableSafely('collections', () =>
        collectionsTable.createTable(),
      );

      this.logger.log('Database initialization completed successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database:', error.stack);
      throw error;
    }
  }

  private async createTableSafely(
    tableName: string,
    createFn: () => Promise<void>,
  ): Promise<void> {
    try {
      const exists = await this.knex.schema.hasTable(tableName);
      if (!exists) {
        this.logger.log(`Creating table: ${tableName}`);
        await createFn();
        this.logger.log(`Table ${tableName} created successfully`);
      } else {
        this.logger.log(`Table ${tableName} already exists, skipping creation`);
      }
    } catch (error) {
      // Log the error but don't throw, allowing other tables to be processed
      this.logger.error(`Error handling table ${tableName}:`, error.stack);
    }
  }
}
