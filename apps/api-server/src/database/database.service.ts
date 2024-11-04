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
      this.logger.log('Initializing database tables...');

      // Initialize tables
      const usersTable = new tables.UsersTable(this.knex, this.dbClient);
      await usersTable.createTable();

      const articlesTable = new tables.ArticlesTable(this.knex, this.dbClient);
      await articlesTable.createTable();

      this.logger.log('Database initialization completed successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database:', error.stack);
      throw error;
    }
  }
}
