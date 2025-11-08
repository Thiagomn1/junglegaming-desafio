import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/task.entity';
import path from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'challenge_db',
      entities: [Task],
      migrations: [
        path.join(
          __dirname,
          process.env.NODE_ENV === 'production'
            ? './migrations/*.js'
            : './migrations/*.ts',
        ),
      ],
      migrationsRun: true,
      synchronize: false,
    }),
    TasksModule,
  ],
})
export class AppModule {}
