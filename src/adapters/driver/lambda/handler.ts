import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import serverlessHttp from 'serverless-http';

let cachedHandler: any;

async function bootstrap() {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  const config = new DocumentBuilder()
    .setTitle('FastFood - CKS Register')
    .setDescription(
      "All API's documentation are described here. For more information, contact the owner of the project.",
    )
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableCors();
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  cachedHandler = serverlessHttp(expressApp);
  return cachedHandler;
}

export const handler = async (event: any, context: any) => {
  const serverlessHandler = await bootstrap();
  context.callbackWaitsForEmptyEventLoop = false;
  return serverlessHandler(event, context);
};
