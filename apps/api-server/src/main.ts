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
    .setDescription('The Distcode CMS API endpoints')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(
    configService.get<number>('app.PORT', { infer: true }),
    configService.get<number>('app.HOST', { infer: true }),
  );

  console.log(await app.getUrl());
}

bootstrap();
