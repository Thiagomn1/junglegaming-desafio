import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto, UpdateTaskDto, CreateCommentDto } from './dto';

@ApiTags('tasks')
@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  private readonly tasksServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tasksServiceUrl = this.configService.get<string>(
      'TASKS_SERVICE_URL',
      'http://tasks-service:5000',
    );
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    try {
      const token = req.headers.authorization;
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.tasksServiceUrl}/tasks`, createTaskDto, {
          headers: { Authorization: token },
        }),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tarefas retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async findAll(@Request() req: any) {
    try {
      const token = req.headers.authorization;
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/tasks`, {
          headers: { Authorization: token },
        }),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma tarefa específica' })
  @ApiResponse({ status: 200, description: 'Tarefa retornada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    try {
      const token = req.headers.authorization;
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/tasks/${id}`, {
          headers: { Authorization: token },
        }),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    try {
      const token = req.headers.authorization;
      const { data } = await firstValueFrom(
        this.httpService.patch(
          `${this.tasksServiceUrl}/tasks/${id}`,
          updateTaskDto,
          {
            headers: { Authorization: token },
          },
        ),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar uma tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa deletada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    try {
      const token = req.headers.authorization;
      const { data } = await firstValueFrom(
        this.httpService.delete(`${this.tasksServiceUrl}/tasks/${id}`, {
          headers: { Authorization: token },
        }),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Criar comentário em uma tarefa' })
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async createComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    try {
      const token = req.headers.authorization;
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.tasksServiceUrl}/tasks/${id}/comments`,
          createCommentDto,
          {
            headers: { Authorization: token },
          },
        ),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Listar comentários de uma tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Lista de comentários retornada com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async findComments(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    try {
      const token = req.headers.authorization;
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/tasks/${id}/comments`, {
          headers: { Authorization: token },
        }),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Obter histórico de alterações de uma tarefa' })
  @ApiResponse({
    status: 200,
    description: 'Histórico retornado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async getHistory(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    try {
      const token = req.headers.authorization;
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.tasksServiceUrl}/tasks/${id}/history`, {
          headers: { Authorization: token },
        }),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }
}
