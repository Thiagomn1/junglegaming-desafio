import { DataSource } from 'typeorm';
import { Task } from './tasks/task.entity';
import { Comment } from './comments/comment.entity';
import { TaskHistory } from './task-history/task-history.entity';

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'challenge_db',
  entities: [Task, Comment, TaskHistory],
  migrations: [isProduction ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  synchronize: false,
});
