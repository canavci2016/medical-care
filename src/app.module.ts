import { Module } from '@nestjs/common';
import { ApplicationModule } from './application/application.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [ApplicationModule, TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
