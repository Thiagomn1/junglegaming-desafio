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

      await this.consumeEvents();
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
        if (eventData.assignees && Array.isArray(eventData.assignees)) {
          affectedUsers.push(...eventData.assignees);
        }
        break;

      case 'task.updated': {
        const changes = eventData.changes || {};

        if (eventData.assignees && Array.isArray(eventData.assignees)) {
          affectedUsers.push(...eventData.assignees);
        }

        if (changes.assignees && Array.isArray(changes.assignees.old)) {
          affectedUsers.push(...changes.assignees.old);
        }

        if (eventData.updatedBy) {
          affectedUsers = affectedUsers.filter(
            (id) => id !== eventData.updatedBy,
          );
        }

        const messageParts: string[] = [];
        const taskTitle = eventData.title || 'tarefa';

        if (changes.status) {
          notificationType = NotificationType.TASK_STATUS_CHANGED;
          const statusMap = {
            TODO: 'A Fazer',
            IN_PROGRESS: 'Em Progresso',
            REVIEW: 'Em Revisão',
            DONE: 'Concluída',
          };
          const newStatus = statusMap[changes.status] || changes.status;
          messageParts.push(`Status: "${newStatus}"`);
        }

        if (changes.priority) {
          if (!notificationType) {
            notificationType = NotificationType.TASK_UPDATED;
          }
          const priorityMap = {
            LOW: 'Baixa',
            MEDIUM: 'Média',
            HIGH: 'Alta',
            URGENT: 'Urgente',
          };
          const newPriority = priorityMap[changes.priority] || changes.priority;
          messageParts.push(`Prioridade: "${newPriority}"`);
        }

        if (changes.assignees) {
          if (!notificationType) {
            notificationType = NotificationType.TASK_ASSIGNED;
          }
          messageParts.push('Responsáveis alterados');
        }

        if (changes.title) {
          if (!notificationType) {
            notificationType = NotificationType.TASK_UPDATED;
          }
          messageParts.push('Título alterado');
        }

        if (changes.description) {
          if (!notificationType) {
            notificationType = NotificationType.TASK_UPDATED;
          }
          messageParts.push('Descrição atualizada');
        }

        if (changes.dueDate) {
          if (!notificationType) {
            notificationType = NotificationType.TASK_UPDATED;
          }
          messageParts.push('Prazo atualizado');
        }

        if (messageParts.length === 0) {
          notificationType = NotificationType.TASK_UPDATED;
          message = `Tarefa atualizada: ${taskTitle}`;
        } else if (messageParts.length === 1) {
          message = `${messageParts[0]} em: ${taskTitle}`;
        } else {
          message = `Alterações em "${taskTitle}": ${messageParts.join(', ')}`;
        }

        if (!notificationType) {
          notificationType = NotificationType.TASK_UPDATED;
        }

        affectedUsers = Array.from(new Set(affectedUsers));
        break;
      }

      case 'task.deleted':
        notificationType = NotificationType.TASK_DELETED;
        message = `Tarefa deletada: ${eventData.title}`;
        if (eventData.authorId) {
          affectedUsers.push(eventData.authorId);
        }
        if (eventData.assignees && Array.isArray(eventData.assignees)) {
          affectedUsers.push(...eventData.assignees);
        }
        affectedUsers = Array.from(new Set(affectedUsers));
        break;

      case 'task.comment.created': {
        notificationType = NotificationType.COMMENT_CREATED;
        message = `Novo comentário em: ${eventData.taskTitle || 'tarefa'}`;

        if (eventData.taskAuthorId) {
          affectedUsers.push(eventData.taskAuthorId);
        }

        if (eventData.assignees && Array.isArray(eventData.assignees)) {
          affectedUsers.push(...eventData.assignees);
        }

        if (eventData.authorId) {
          affectedUsers = affectedUsers.filter(
            (id) => id !== eventData.authorId,
          );
        }

        affectedUsers = Array.from(new Set(affectedUsers));
        break;
      }

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
            id: notification.id,
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
