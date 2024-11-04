import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import config from '@api-server/config';
import { DatabaseModule } from '@api-server/database/database.module';
import { ContentManagerModule } from '@api-server/content-manager/content-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: config,
    }),
    DatabaseModule,
    AuthModule,
    AdminModule,
    ContentManagerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
