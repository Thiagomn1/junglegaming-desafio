import { DataSource } from 'typeorm';
import { User } from './auth/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'challenge_db',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // NUNCA use true em produção!
});
