import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { TaskHistoryModule } from './task-history/task-history.module';
import { AppDataSource } from './data-source';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      migrationsRun: true,
    }),
    TasksModule,
    CommentsModule,
    TaskHistoryModule,
  ],
})
export class AppModule {}
