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
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@ApiTags('tasks')
@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  private readonly tasksServiceUrl =
    process.env.TASKS_SERVICE_URL || 'http://tasks-service:5000';

  constructor(private readonly httpService: HttpService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    const token = req.headers.authorization;
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.tasksServiceUrl}/tasks`, createTaskDto, {
        headers: { Authorization: token },
      }),
    );
    return data;
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as tarefas' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas retornada com sucesso' })
  async findAll(@Request() req: any) {
    const token = req.headers.authorization;
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.tasksServiceUrl}/tasks`, {
        headers: { Authorization: token },
      }),
    );
    return data;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter uma tarefa específica' })
  @ApiResponse({ status: 200, description: 'Tarefa retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const token = req.headers.authorization;
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.tasksServiceUrl}/tasks/${id}`, {
        headers: { Authorization: token },
      }),
    );
    return data;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
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
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar uma tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const token = req.headers.authorization;
    const { data } = await firstValueFrom(
      this.httpService.delete(`${this.tasksServiceUrl}/tasks/${id}`, {
        headers: { Authorization: token },
      }),
    );
    return data;
  }
}
