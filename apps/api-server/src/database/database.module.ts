import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { knex, Knex } from 'knex';
import { DatabaseConfig } from '@api-server/config/database.config';
import { CrudService } from './crud.service';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'KNEX_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<Knex> => {
        const config = configService.get<DatabaseConfig>('database');
        if (!config) {
          throw new Error('Database configuration not found');
        }

        try {
          const knexInstance = knex(config);
          // Test the connection
          await knexInstance.raw('SELECT 1');
          return knexInstance;
        } catch (error) {
          throw new Error(`Failed to connect to database: ${error.message}`);
        }
      },
    },
    DatabaseService,
    CrudService,
  ],
  exports: ['KNEX_CONNECTION', CrudService],
})
export class DatabaseModule {}
