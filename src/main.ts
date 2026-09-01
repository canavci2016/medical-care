import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import hbs from 'hbs';
import session from 'express-session';
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
      return str?.slice(index, index + length) || str;
    },
  );

  hbs.registerHelper(
    'toUpperCase',
    function (str: string, index: number, length: number) {
      return str?.toUpperCase() || str;
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

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT || 8080);
}
bootstrap().catch((error) => {
  // If bootstrapping fails (e.g. the database or redis is unreachable),
  // exit the process instead of hanging forever with no port bound.
  // This lets the host process manager (e.g. Elastic Beanstalk) restart
  // the app and retry, rather than leaving it stuck and failing health checks
  // indefinitely until the deployment times out.
  console.error('Failed to bootstrap application', error);
  process.exit(1);
});
