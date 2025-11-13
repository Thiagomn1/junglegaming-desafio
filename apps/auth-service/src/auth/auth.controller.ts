import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  AuthResponseDto,
  UserResponseDto,
} from './dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Usuário já existe' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token de atualização inválido' })
  async refresh(@Body() refreshDto: RefreshDto): Promise<AuthResponseDto> {
    return this.authService.refresh(refreshDto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário atual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário recuperado',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    return this.authService.validateUser(req.user.id);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Obter informações básicas de um usuário por ID' })
  @ApiResponse({
    status: 200,
    description: 'Informações do usuário',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        username: { type: 'string', example: 'john_doe' },
        email: { type: 'string', example: 'john@example.com' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.authService.validateUser(id);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos os usuários (para atribuição de tarefas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          username: { type: 'string', example: 'john_doe' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getAllUsers() {
    return await this.authService.getAllUsers();
  }
}
