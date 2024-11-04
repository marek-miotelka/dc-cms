import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('Distcode CMS')
    .setDescription('The Distcode CMS API documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('auth/local', 'Local authentication (username/password)')
    .addTag('auth/google', 'Google OAuth2 authentication')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(
    configService.getOrThrow<number>('app.PORT', { infer: true }),
    configService.getOrThrow<string>('app.HOST', { infer: true }),
  );

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`API documentation available at: ${await app.getUrl()}/docs`);
}

bootstrap();
