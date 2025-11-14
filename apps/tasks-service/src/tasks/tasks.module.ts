import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { TaskHistoryModule } from '../task-history/task-history.module';
import { AuthClientModule } from '../auth-client/auth-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    PassportModule,
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
  providers: [TasksService, RabbitMQService, JwtStrategy],
  exports: [TasksService],
})
export class TasksModule {}
