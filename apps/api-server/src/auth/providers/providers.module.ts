import { Module } from '@nestjs/common';
import { LocalStrategyModule } from './local/local.module';
import { GoogleStrategyModule } from './google/google.module';
import { ProvidersController } from './providers.controller';
import { ProviderService } from './provider.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, LocalStrategyModule, GoogleStrategyModule],
  exports: [LocalStrategyModule, GoogleStrategyModule, ProviderService],
  controllers: [ProvidersController],
  providers: [ProviderService],
})
export class ProvidersModule {}
