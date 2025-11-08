import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
} from '@jungle/types';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private rabbitMQService: RabbitMQService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.tasksRepository.create({
      ...createTaskDto,
      createdBy: userId,
      assignees: createTaskDto.assignees || [],
    });

    const savedTask = await this.tasksRepository.save(task);

    // Publicar evento task.created
    const event: TaskCreatedEvent = {
      taskId: savedTask.id,
      title: savedTask.title,
      createdBy: savedTask.createdBy,
      assignees: savedTask.assignees,
      priority: savedTask.priority,
      dueDate: savedTask.dueDate,
      timestamp: new Date().toISOString(),
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

    // Publicar evento task.updated
    const event: TaskUpdatedEvent = {
      taskId: updatedTask.id,
      updatedBy: userId || task.createdBy,
      changes: updateTaskDto,
      timestamp: new Date().toISOString(),
    };
    await this.rabbitMQService.publishEvent('task.updated', event);

    return updatedTask;
  }

  async remove(id: number, userId?: number): Promise<void> {
    const task = await this.findOne(id);

    await this.tasksRepository.remove(task);

    // Publicar evento task.deleted
    const event: TaskDeletedEvent = {
      taskId: id,
      deletedBy: userId || task.createdBy,
      timestamp: new Date().toISOString(),
    };
    await this.rabbitMQService.publishEvent('task.deleted', event);
  }
}
