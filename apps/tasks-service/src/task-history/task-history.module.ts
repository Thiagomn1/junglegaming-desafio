import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskHistoryService } from './task-history.service';
import { TaskHistory } from './task-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaskHistory])],
  providers: [TaskHistoryService],
  exports: [TaskHistoryService],
})
export class TaskHistoryModule {}
