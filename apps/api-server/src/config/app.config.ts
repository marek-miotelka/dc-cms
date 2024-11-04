import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  HOST: process.env.API_SERVER_HOST || 'localhost',
  PORT: process.env.API_SERVER_PORT
    ? parseInt(process.env.API_SERVER_PORT)
    : 4000,
}));
