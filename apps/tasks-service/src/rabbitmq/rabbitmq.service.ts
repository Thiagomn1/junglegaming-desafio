import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly exchange = 'tasks_events';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      const rabbitMQUrl = this.configService.get<string>(
        'RABBITMQ_URL',
        'amqp://admin:admin@rabbitmq:5672',
      );

      this.connection = await amqp.connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.exchange, 'topic', {
        durable: true,
      });

      this.logger.log('✅ Conectado ao RabbitMQ');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar ao RabbitMQ:', error);
      setTimeout(() => {
        void this.connect();
      }, 5000);
    }
  }

  private async disconnect() {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('Desconectado do RabbitMQ');
    } catch (error) {
      this.logger.error('Erro ao desconectar do RabbitMQ:', error);
    }
  }

  async publishEvent(routingKey: string, data: any) {
    try {
      if (!this.channel) {
        this.logger.warn(
          'Canal RabbitMQ não disponível, tentando reconectar...',
        );
        await this.connect();
      }

      const message = Buffer.from(JSON.stringify(data));

      this.channel.publish(this.exchange, routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });

      this.logger.log(`📤 Evento publicado: ${routingKey}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao publicar evento ${routingKey}:`, error);
    }
  }
}
