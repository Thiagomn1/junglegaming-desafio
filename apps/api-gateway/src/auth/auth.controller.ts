import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
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

  constructor(private readonly httpService: HttpService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Usuário já existe' })
  async register(@Body() registerDto: RegisterDto) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/register`,
          registerDto,
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

  @Post('login')
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto),
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar token de acesso' })
  @ApiResponse({ status: 200, description: 'Token renovado com sucesso' })
  @ApiResponse({ status: 401, description: 'Token de atualização inválido' })
  async refresh(@Body() refreshDto: RefreshDto) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${this.authServiceUrl}/auth/refresh`,
          refreshDto,
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

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter perfil do usuário atual' })
  @ApiResponse({ status: 200, description: 'Perfil do usuário recuperado' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getProfile(@Request() req: any) {
    try {
      const token = req.headers.authorization;
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.authServiceUrl}/auth/profile`, {
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
