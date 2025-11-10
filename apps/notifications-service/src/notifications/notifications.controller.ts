import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as notificações do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificações retornada',
    type: [NotificationResponseDto],
  })
  async findAll(@Request() req: any): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsService.findAllByUser(
      req.user.id,
    );
    return notifications.map((n) => new NotificationResponseDto(n));
  }

  @Get('unread')
  @ApiOperation({ summary: 'Listar notificações não lidas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificações não lidas',
    type: [NotificationResponseDto],
  })
  async findUnread(@Request() req: any): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationsService.findUnreadByUser(
      req.user.id,
    );
    return notifications.map((n) => new NotificationResponseDto(n));
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  @ApiResponse({
    status: 200,
    description: 'Contagem de notificações não lidas',
  })
  async getUnreadCount(@Request() req: any): Promise<{ count: number }> {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({
    status: 200,
    description: 'Notificação marcada como lida',
    type: NotificationResponseDto,
  })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.markAsRead(
      id,
      req.user.id,
    );
    return new NotificationResponseDto(notification);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({
    status: 200,
    description: 'Todas as notificações foram marcadas como lidas',
  })
  async markAllAsRead(@Request() req: any): Promise<{ success: boolean }> {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true };
  }
}
