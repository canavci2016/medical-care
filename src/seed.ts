import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './application/application.module';
import { SeederService } from './application/shared/seeder/seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(ApplicationModule);

  const seeder = app.get(SeederService);

  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');
  const nameArg = args.find((arg) => arg.startsWith('--name='));
  const seedNameFromArg = nameArg
    ? nameArg.split('=')[1]?.trim().toLowerCase()
    : undefined;
  const seedNameFromNpmConfig = process.env.npm_config_name
    ?.trim()
    .toLowerCase();
  const seedName = seedNameFromArg || seedNameFromNpmConfig;

  try {
    if (shouldClear) {
      await seeder.clear(seedName);
    } else {
      await seeder.seed(seedName);
    }
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
