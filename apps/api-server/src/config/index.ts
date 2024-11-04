import appConfig from '@api-server/config/app.config';
import jwtConfig from '@api-server/config/jwt.config';
import providersConfig from '@api-server/config/providers.config';
import databaseConfig from '@api-server/config/database.config';
import { ConfigFactory } from '@nestjs/config/dist/interfaces/config-factory.interface';

const index: Array<ConfigFactory | Promise<ConfigFactory>> = [
  appConfig,
  jwtConfig,
  providersConfig,
  databaseConfig,
];

export default index;
