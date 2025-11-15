import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { JwtAuthGuard } from '@jungle/auth';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar comentário em uma tarefa' })
  @ApiParam({ name: 'taskId', description: 'ID da tarefa' })
  @ApiResponse({
    status: 201,
    description: 'Comentário criado com sucesso',
    type: CommentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(taskId, createCommentDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar comentários de uma tarefa' })
  @ApiParam({ name: 'taskId', description: 'ID da tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentários retornada com sucesso',
    type: [CommentResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async findAll(
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<CommentResponseDto[]> {
    return this.commentsService.findByTaskId(taskId);
  }
}
