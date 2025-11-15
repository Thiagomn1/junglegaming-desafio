import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsConsumer } from './notifications.consumer';
import { Notification } from './notification.entity';
import { NotificationsGateway } from '../websocket/websocket.gateway';
import { JungleAuthModule } from '@jungle/auth';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Notification]),
    JungleAuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'default-secret-change-in-prod',
        ),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsConsumer,
    NotificationsGateway,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
