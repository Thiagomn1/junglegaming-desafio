import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto, TaskResponseDto } from './dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { TaskHistoryService } from '../task-history/task-history.service';
import {
  TaskHistoryAction,
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
} from '@jungle/types';
import { formatDate } from '@jungle/utils';
import { AuthClientService } from '../auth-client/auth-client.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private rabbitMQService: RabbitMQService,
    private taskHistoryService: TaskHistoryService,
    private authClientService: AuthClientService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      createdBy: userId,
      assignees: createTaskDto.assignees || [],
    });

    const savedTask = await this.tasksRepository.save(task);

    await this.taskHistoryService.createHistoryEntry(
      savedTask.id,
      TaskHistoryAction.CREATED,
      userId,
      { title: savedTask.title, priority: savedTask.priority },
    );

    const event: TaskCreatedEvent = {
      taskId: savedTask.id,
      title: savedTask.title,
      createdBy: savedTask.createdBy,
      assignees: savedTask.assignees,
      priority: savedTask.priority,
      dueDate: savedTask.dueDate,
      timestamp: formatDate(new Date()),
    };
    await this.rabbitMQService.publishEvent('task.created', event);

    return savedTask;
  }

  async findAll(): Promise<TaskResponseDto[]> {
    const tasks = await this.tasksRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const createdByUsername = await this.authClientService.getUsernameById(
          task.createdBy,
        );

        const assigneesDetails = await Promise.all(
          (task.assignees || []).map(async (assigneeId) => {
            const username =
              await this.authClientService.getUsernameById(assigneeId);
            return {
              id: assigneeId,
              username: username || `Usuário #${assigneeId}`,
            };
          }),
        );

        return {
          ...task,
          createdByUsername,
          assigneesDetails,
        } as TaskResponseDto;
      }),
    );

    return enrichedTasks;
  }

  async findOne(id: number): Promise<TaskResponseDto> {
    const task = await this.tasksRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    const [createdByUsername, assigneesDetails] = await Promise.all([
      this.authClientService.getUsernameById(task.createdBy),
      Promise.all(
        (task.assignees || []).map(async (assigneeId) => {
          const username =
            await this.authClientService.getUsernameById(assigneeId);
          return {
            id: assigneeId,
            username: username || `Usuário #${assigneeId}`,
          };
        }),
      ),
    ]);

    return {
      ...task,
      createdByUsername,
      assigneesDetails,
    } as TaskResponseDto;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId?: number,
  ): Promise<Task> {
    const task = await this.findOne(id);

    Object.assign(task, updateTaskDto);

    const updatedTask = await this.tasksRepository.save(task);

    await this.taskHistoryService.createHistoryEntry(
      updatedTask.id,
      TaskHistoryAction.UPDATED,
      userId,
      { changes: updateTaskDto },
    );

    const event: TaskUpdatedEvent = {
      taskId: updatedTask.id,
      title: updatedTask.title,
      assignees: updatedTask.assignees,
      updatedBy: userId || task.createdBy,
      changes: updateTaskDto as Record<string, unknown>,
      timestamp: formatDate(new Date()),
    };
    await this.rabbitMQService.publishEvent('task.updated', event);

    return updatedTask;
  }

  async remove(id: number, userId?: number): Promise<void> {
    const task = await this.findOne(id);

    await this.taskHistoryService.createHistoryEntry(
      id,
      TaskHistoryAction.DELETED,
      userId,
      { title: task.title },
    );

    await this.tasksRepository.remove(task);

    const event: TaskDeletedEvent = {
      taskId: id,
      title: task.title,
      deletedBy: userId || task.createdBy,
      assignees: task.assignees,
      authorId: task.createdBy,
      timestamp: formatDate(new Date()),
    };
    await this.rabbitMQService.publishEvent('task.deleted', event);
  }
}
