import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import axios from 'axios';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, LoginDto, RefreshDto } from './dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  private readonly authServiceUrl =
    process.env.AUTH_SERVICE_URL || 'http://auth-service:4000';

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 401, description: 'Usuário já existe' })
  async register(@Body() registerDto: RegisterDto) {
    const response = await axios.post(
      `${this.authServiceUrl}/auth/register`,
      registerDto,
    );
    return response.data;
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    const response = await axios.post(
      `${this.authServiceUrl}/auth/login`,
      loginDto,
    );
    return response.data;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token de atualização inválido' })
  async refresh(@Body() refreshDto: RefreshDto) {
    const response = await axios.post(
      `${this.authServiceUrl}/auth/refresh`,
      refreshDto,
    );
    return response.data;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário atual' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário recuperado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(@Request() req: any) {
    const token = req.headers.authorization;
    const response = await axios.get(`${this.authServiceUrl}/auth/profile`, {
      headers: { Authorization: token },
    });
    return response.data;
  }
}
