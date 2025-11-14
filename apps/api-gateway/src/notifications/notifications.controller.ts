import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AxiosError } from 'axios';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  private readonly notificationsServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.notificationsServiceUrl = this.configService.get<string>(
      'NOTIFICATIONS_SERVICE_URL',
      'http://notifications-service:6000',
    );
  }

  @Get()
  async findAll(@Request() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.notificationsServiceUrl}/notifications`, {
          headers: { Authorization: req.headers.authorization },
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

  @Get('unread')
  async findUnread(@Request() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.notificationsServiceUrl}/notifications/unread`,
          {
            headers: { Authorization: req.headers.authorization },
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

  @Get('unread/count')
  async getUnreadCount(@Request() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${this.notificationsServiceUrl}/notifications/unread/count`,
          {
            headers: { Authorization: req.headers.authorization },
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

  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(
          `${this.notificationsServiceUrl}/notifications/${id}/read`,
          {},
          {
            headers: { Authorization: req.headers.authorization },
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

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(
          `${this.notificationsServiceUrl}/notifications/read-all`,
          {},
          {
            headers: { Authorization: req.headers.authorization },
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
}
