import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { TaskHistoryModule } from './task-history/task-history.module';
import { AuthClientModule } from './auth-client/auth-client.module';
import { Task } from './tasks/task.entity';
import { Comment } from './comments/comment.entity';
import { TaskHistory } from './task-history/task-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'challenge_db',
      entities: [Task, Comment, TaskHistory],
      synchronize: false,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TasksModule,
    CommentsModule,
    TaskHistoryModule,
    AuthClientModule,
  ],
})
export class AppModule {}
