import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { TaskHistoryModule } from '../task-history/task-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' },
    }),
    TaskHistoryModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, RabbitMQService, JwtStrategy],
  exports: [TasksService],
})
export class TasksModule {}
