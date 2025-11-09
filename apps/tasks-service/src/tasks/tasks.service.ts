import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { TaskHistoryService } from '../task-history/task-history.service';
import {
  TaskHistoryAction,
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
  TaskWithMetadata,
} from '@jungle/types';
import {
  formatDate,
  isTaskOverdue,
  isTaskDueSoon,
  getDaysUntilDue,
} from '@jungle/utils';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private rabbitMQService: RabbitMQService,
    private taskHistoryService: TaskHistoryService,
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

  async findAll(): Promise<Task[]> {
    return this.tasksRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${id} não encontrada`);
    }

    return task;
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
      deletedBy: userId || task.createdBy,
      timestamp: formatDate(new Date()),
    };
    await this.rabbitMQService.publishEvent('task.deleted', event);
  }

  async findAllWithMetadata(): Promise<TaskWithMetadata[]> {
    const tasks = await this.findAll();
    return tasks.map((task) => this.addTaskMetadata(task));
  }

  async findOneWithMetadata(id: number): Promise<TaskWithMetadata> {
    const task = await this.findOne(id);
    return this.addTaskMetadata(task);
  }

  private addTaskMetadata(task: Task): TaskWithMetadata {
    return {
      ...task,
      isOverdue: isTaskOverdue(task.dueDate),
      isDueSoon: isTaskDueSoon(task.dueDate),
      daysUntilDue: task.dueDate ? getDaysUntilDue(task.dueDate) : null,
    };
  }
}
