import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './application/application.module';
import { SeederService } from './application/shared/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApplicationModule);

  const seeder = app.get(SeederService);

  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');

  try {
    if (shouldClear) {
      await seeder.clear();
    } else {
      await seeder.seed();
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
