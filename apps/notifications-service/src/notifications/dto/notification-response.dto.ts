import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@jungle/types';
import { Notification } from '../notification.entity';

export class NotificationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  message: string;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  taskId: number;

  @ApiProperty()
  read: boolean;

  @ApiProperty({ required: false })
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  constructor(notification: Notification) {
    this.id = notification.id;
    this.type = notification.type;
    this.message = notification.message;
    this.userId = notification.userId;
    this.taskId = notification.taskId;
    this.read = notification.read;
    this.metadata = notification.metadata;
    this.createdAt = notification.createdAt;
  }
}
