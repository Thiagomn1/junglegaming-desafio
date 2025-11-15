import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { Task } from '../tasks/task.entity';
import { TaskHistoryService } from '../task-history/task-history.service';
import { TaskHistoryAction, TaskCommentCreatedEvent } from '@jungle/types';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { AuthClientService } from '../auth-client/auth-client.service';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    private rabbitMQService: RabbitMQService,
    private taskHistoryService: TaskHistoryService,
    private authClientService: AuthClientService,
  ) {}

  async create(
    taskId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<Comment> {
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

    await this.taskHistoryService.createHistoryEntry(
      taskId,
      TaskHistoryAction.COMMENTED,
      userId,
      { commentId: savedComment.id, text: savedComment.text },
    );

    const event: TaskCommentCreatedEvent = {
      commentId: savedComment.id,
      taskId,
      authorId: userId,
      text: savedComment.text,
      createdAt: savedComment.createdAt,
      taskAuthorId: task.createdBy,
      taskTitle: task.title,
      assignees: task.assignees || [],
    };
    await this.rabbitMQService.publishEvent('task.comment.created', event);

    this.logger.log(
      `Comentário ${savedComment.id} criado na tarefa ${taskId} por usuário ${userId}`,
    );

    return savedComment;
  }

  async findByTaskId(taskId: number): Promise<CommentResponseDto[]> {
    const task = await this.tasksRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Tarefa com ID ${taskId} não encontrada`);
    }

    const comments = await this.commentsRepository.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });

    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const authorName = await this.authClientService.getUsernameById(
          comment.authorId,
        );
        return { ...comment, authorName } as CommentResponseDto;
      }),
    );

    return enrichedComments;
  }
}
