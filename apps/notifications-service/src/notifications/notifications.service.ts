import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationPayload } from '@jungle/types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async createNotification(
    payload: NotificationPayload,
  ): Promise<Notification> {
    this.logger.log(
      `Criando notificação: ${payload.type} para usuário ${payload.userId}`,
    );

    const notification = this.notificationsRepository.create({
      type: payload.type,
      message: payload.message,
      userId: payload.userId,
      taskId: payload.taskId,
      metadata: payload.metadata,
      read: false,
    });

    return this.notificationsRepository.save(notification);
  }

  async findAllByUser(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findUnreadByUser(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId, read: false },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    notification.read = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationsRepository.update(
      { userId, read: false },
      { read: true },
    );
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, read: false },
    });
  }
}
