import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { TaskHistoryModule } from './task-history/task-history.module';
import { AuthClientModule } from './auth-client/auth-client.module';
import { AppDataSource } from './data-source';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
      migrationsRun: true,
    }),
    TasksModule,
    CommentsModule,
    TaskHistoryModule,
    AuthClientModule,
  ],
})
export class AppModule {}
