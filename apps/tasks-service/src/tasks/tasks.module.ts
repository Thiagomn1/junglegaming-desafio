import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { JungleAuthModule } from '@jungle/auth';
import { TaskHistoryModule } from '../task-history/task-history.module';
import { AuthClientModule } from '../auth-client/auth-client.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Task]),
    JungleAuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    TaskHistoryModule,
    AuthClientModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, RabbitMQService],
  exports: [TasksService],
})
export class TasksModule {}
