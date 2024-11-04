import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DynamicCollectionsSwaggerPlugin } from '@api-server/content-manager/swagger/swagger.plugin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  const configService = app.get(ConfigService);

  // Setup Swagger documentation
  await DynamicCollectionsSwaggerPlugin.setup(app);

  await app.listen(
    configService.getOrThrow<number>('app.PORT', { infer: true }),
    configService.getOrThrow<string>('app.HOST', { infer: true }),
  );

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`API documentation available at: ${await app.getUrl()}/docs`);
}

bootstrap();
