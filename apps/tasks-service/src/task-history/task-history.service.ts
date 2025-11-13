import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskHistory } from './task-history.entity';
import { TaskHistoryAction } from '@jungle/types';
import { TaskHistoryResponseDto } from './dto';
import { AuthClientService } from '../auth-client/auth-client.service';

@Injectable()
export class TaskHistoryService {
  private readonly logger = new Logger(TaskHistoryService.name);

  constructor(
    @InjectRepository(TaskHistory)
    private taskHistoryRepository: Repository<TaskHistory>,
    private authClientService: AuthClientService,
  ) {}

  async createHistoryEntry(
    taskId: number,
    action: TaskHistoryAction,
    userId?: number,
    metadata?: Record<string, unknown>,
  ): Promise<TaskHistory> {
    const historyEntry = this.taskHistoryRepository.create({
      taskId,
      action,
      userId,
      metadata,
    });

    const saved = await this.taskHistoryRepository.save(historyEntry);
    this.logger.log(
      `Histórico registrado: ${action} na tarefa ${taskId} por usuário ${userId}`,
    );

    return saved;
  }

  async findByTaskId(taskId: number): Promise<TaskHistoryResponseDto[]> {
    const history = await this.taskHistoryRepository.find({
      where: { taskId },
      order: { timestamp: 'DESC' },
    });

    const enrichedHistory = await Promise.all(
      history.map(async (entry) => {
        let username: string | null | undefined = null;

        if (entry.userId) {
          username = await this.authClientService.getUsernameById(entry.userId);
        }

        return {
          ...entry,
          username,
        } as TaskHistoryResponseDto;
      }),
    );

    return enrichedHistory;
  }
}
