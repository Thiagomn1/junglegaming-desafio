import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './comment.entity';
import { Task } from '../tasks/task.entity';
import { TaskHistoryModule } from '../task-history/task-history.module';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Task]), TaskHistoryModule],
  controllers: [CommentsController],
  providers: [CommentsService, RabbitMQService],
  exports: [CommentsService],
})
export class CommentsModule {}
