import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebSocketNotification, JwtPayload } from '@jungle/types';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<number, Set<string>>();

  constructor(private readonly jwtService: JwtService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway iniciado');
  }

  handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new UnauthorizedException('Token não fornecido');
      }

      const payload: JwtPayload = this.jwtService.verify(token);
      const userId = payload.id;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);

      client.data.userId = userId;
      client.data.username = payload.username;

      void client.join(`user:${userId}`);

      this.logger.log(
        `Cliente conectado: ${client.id} (Usuário: ${payload.username}, ID: ${userId})`,
      );

      client.emit('connected', {
        message: 'Conectado ao servidor de notificações',
        userId,
      });
    } catch (error: any) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit('error', { message: 'Autenticação falhou' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(client.id);

      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }

    this.logger.log(`Cliente desconectado: ${client.id} (User ID: ${userId})`);
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const authHeader =
      client.handshake.headers.authorization ||
      client.handshake.auth.token ||
      client.handshake.query.token;

    if (typeof authHeader === 'string') {
      return authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;
    }

    return null;
  }

  sendNotificationToUser(userId: number, notification: WebSocketNotification) {
    const room = `user:${userId}`;
    this.logger.log(
      `Enviando notificação ao usuário ${userId}: ${notification.type}`,
    );
    this.server.to(room).emit('notification', notification);
  }

  isUserConnected(userId: number): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId).size > 0
    );
  }

  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }
}
