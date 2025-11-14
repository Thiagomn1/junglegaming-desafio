import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel, ConsumeMessage } from 'amqplib';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from '../websocket/websocket.gateway';
import {
  NotificationType,
  NotificationPayload,
  WebSocketNotification,
} from '@jungle/types';

@Injectable()
export class NotificationsConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationsConsumer.name);
  private connection: Connection;
  private channel: Channel;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly websocketGateway: NotificationsGateway,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.connect();
    await this.consumeEvents();
  }

  private async connect() {
    const rabbitmqUrl = this.configService.get<string>(
      'RABBITMQ_URL',
      'amqp://admin:admin@rabbitmq:5672',
    );

    try {
      this.connection = await connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange('tasks_events', 'topic', {
        durable: true,
      });
      const { queue } = await this.channel.assertQueue('notifications', {
        durable: true,
      });

      await this.channel.bindQueue(queue, 'tasks_events', 'task.created');
      await this.channel.bindQueue(queue, 'tasks_events', 'task.updated');
      await this.channel.bindQueue(queue, 'tasks_events', 'task.deleted');
      await this.channel.bindQueue(
        queue,
        'tasks_events',
        'task.comment.created',
      );

      this.logger.log('Conectado ao RabbitMQ e filas configuradas');
    } catch (error: any) {
      this.logger.error(`Falha ao conectar ao RabbitMQ: ${error.message}`);
      setTimeout(() => {
        void this.connect();
      }, 5000);
    }
  }

  private async consumeEvents() {
    try {
      await this.channel.consume(
        'notifications',
        async (msg: ConsumeMessage) => {
          if (msg) {
            try {
              const content = JSON.parse(msg.content.toString());
              const routingKey = msg.fields.routingKey;

              this.logger.log(
                `Evento recebido: ${routingKey}`,
                JSON.stringify(content),
              );

              await this.processEvent(routingKey, content);

              this.channel.ack(msg);
            } catch (error: any) {
              this.logger.error(`Erro ao processar mensagem: ${error.message}`);
              this.channel.nack(msg, false, false);
            }
          }
        },
        { noAck: false },
      );

      this.logger.log('Iniciando o consumo de eventos da fila de notificações');
    } catch (error: any) {
      this.logger.error(`Falha ao consumir eventos: ${error.message}`);
    }
  }

  private async processEvent(routingKey: string, eventData: any) {
    let notificationType: NotificationType;
    let message: string;
    let affectedUsers: number[] = [];

    switch (routingKey) {
      case 'task.created':
        notificationType = NotificationType.TASK_CREATED;
        message = `Nova tarefa criada: ${eventData.title}`;
        if (eventData.createdBy) {
          affectedUsers.push(eventData.createdBy);
        }
        break;

      case 'task.updated':
        notificationType = NotificationType.TASK_UPDATED;
        message = `Tarefa atualizada`;

        if (eventData.updatedBy) {
          affectedUsers.push(eventData.updatedBy);
        }

        if (eventData.changes && eventData.changes.status) {
          notificationType = NotificationType.TASK_STATUS_CHANGED;
          message = `Status da tarefa alterado para: ${eventData.changes.status}`;
        }
        break;

      case 'task.deleted':
        notificationType = NotificationType.TASK_DELETED;
        message = `Tarefa deletada: ${eventData.title}`;
        if (eventData.authorId) {
          affectedUsers.push(eventData.authorId);
        }
        break;

      case 'task.comment.created':
        notificationType = NotificationType.COMMENT_CREATED;
        message = `Novo comentário em: ${eventData.taskTitle || 'tarefa'}`;

        if (eventData.taskAuthorId) {
          affectedUsers.push(eventData.taskAuthorId);
        }

        if (eventData.authorId && affectedUsers.includes(eventData.authorId)) {
          affectedUsers = affectedUsers.filter(
            (id) => id !== eventData.authorId,
          );
        }
        break;

      default:
        this.logger.warn(`Unknown routing key: ${routingKey}`);
        return;
    }

    for (const userId of affectedUsers) {
      try {
        const notificationPayload: NotificationPayload = {
          type: notificationType,
          userId,
          taskId: eventData.id || eventData.taskId,
          message,
          metadata: eventData,
        };

        const notification =
          await this.notificationsService.createNotification(
            notificationPayload,
          );

        if (this.websocketGateway.isUserConnected(userId)) {
          const wsNotification: WebSocketNotification = {
            type: notificationType,
            message,
            taskId: eventData.id || eventData.taskId,
            metadata: eventData,
            timestamp: notification.createdAt,
          };

          this.websocketGateway.sendNotificationToUser(userId, wsNotification);
        }

        this.logger.log(
          `Notificação criada e enviada para usuário ${userId}: ${notificationType}`,
        );
      } catch (error: any) {
        this.logger.error(
          `Erro ao criar notificação para usuário ${userId}: ${error.message}`,
        );
      }
    }
  }

  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    this.logger.log('Desconectado do RabbitMQ');
  }
}
