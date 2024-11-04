import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const databaseConfigSchema = z.object({
  client: z.enum(['mysql2', 'pg']),
  connection: z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
  }),
  pool: z.object({
    min: z.number(),
    max: z.number(),
  }),
  migrations: z.object({
    tableName: z.string(),
    directory: z.string(),
  }),
});

export type DatabaseConfig = z.infer<typeof databaseConfigSchema>;

export default registerAs('database', () => {
  const config = {
    client: process.env.DB_CLIENT || 'mysql2',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'distcode_cms',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
  };

  return databaseConfigSchema.parse(config);
});
