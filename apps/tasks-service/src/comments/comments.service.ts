import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Task } from '../tasks/task.entity';
import { TaskHistoryService } from '../task-history/task-history.service';
import { TaskHistoryAction } from '../task-history/task-history.entity';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @Inject('RABBITMQ_SERVICE')
    private rabbitClient: ClientProxy,
    private taskHistoryService: TaskHistoryService,
  ) {}

  async create(
    taskId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<Comment> {
    // Verificar se a tarefa existe
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${taskId} não encontrada`);
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      taskId,
      authorId: userId,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // Registrar no histórico
    await this.taskHistoryService.createHistoryEntry(
      taskId,
      TaskHistoryAction.COMMENTED,
      userId,
      { commentId: savedComment.id, text: savedComment.text },
    );

    // Publicar evento no RabbitMQ
    this.rabbitClient
      .emit('task.comment.created', {
        commentId: savedComment.id,
        taskId,
        authorId: userId,
        text: savedComment.text,
        createdAt: savedComment.createdAt,
      })
      .subscribe({
        error: (err) =>
          this.logger.error('Erro ao publicar evento de comentário', err),
      });

    this.logger.log(
      `Comentário ${savedComment.id} criado na tarefa ${taskId} por usuário ${userId}`,
    );

    return savedComment;
  }

  async findByTaskId(taskId: number): Promise<Comment[]> {
    // Verificar se a tarefa existe
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${taskId} não encontrada`);
    }

    return this.commentsRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }
}
