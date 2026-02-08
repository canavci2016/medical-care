import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs from 'hbs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname));
  hbs.registerHelper('eq', (a, b) => {
    return a == b;
  });
  hbs.registerHelper('querystring', (query, options) => {
    const overrides = options.hash;

    return new URLSearchParams({
      ...query,
      ...overrides,
    }).toString();
  });
  hbs.registerHelper('json', (context) => {
    return JSON.stringify(context);
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
