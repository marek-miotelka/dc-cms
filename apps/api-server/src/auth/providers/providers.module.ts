import { Module } from '@nestjs/common';
import { LocalStrategyModule } from './local/local.module';
import { ProvidersController } from './providers.controller';

@Module({
  imports: [LocalStrategyModule],
  exports: [LocalStrategyModule],
  controllers: [ProvidersController],
})
export class ProvidersModule {}
