import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskHistoryService } from './task-history.service';
import { TaskHistory } from './task-history.entity';
import { AuthClientModule } from '../auth-client/auth-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskHistory]), AuthClientModule],
  providers: [TaskHistoryService],
  exports: [TaskHistoryService],
})
export class TaskHistoryModule {}
