import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs from 'hbs';
import session from 'express-session';
import flash from 'connect-flash';
import { ValidationPipe } from '@nestjs/common';
import { formatDistanceToNow } from 'date-fns';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(
    join(__dirname, '../src/application/modules/site', 'public'),
  );
  app.setViewEngine('hbs');

  app.setBaseViewsDir(
    join(__dirname, '../src/application/modules/site', 'views'),
  );

  hbs.registerPartials(
    join(__dirname, '../src/application/modules/site', 'views', 'partials'),
  );

  app.set('view options', {
    layout: 'layouts/main',
  });

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

  hbs.registerHelper('stars', function (rating: number) {
    let result = '';

    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const totalStars = 5;

    for (let i = 0; i < fullStars; i++) {
      result += '<i class="fa-solid fa-star"></i>';
    }

    if (hasHalf) {
      result += '<i class="fa-solid fa-star-half-stroke"></i>';
    }

    const remaining = totalStars - fullStars - (hasHalf ? 1 : 0);

    for (let i = 0; i < remaining; i++) {
      result += '<i class="fa-regular fa-star"></i>';
    }

    return new hbs.handlebars.SafeString(result);
  });

  hbs.registerHelper(
    'slice',
    function (str: string, index: number, length: number) {
      return str.slice(index, index + length);
    },
  );

  hbs.registerHelper('relative_date', function (date: string) {
    return date
      ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
      : '';
  });

  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
      },
    }),
  );

  app.use(flash());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
