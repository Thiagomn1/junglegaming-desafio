import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '@jungle/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'default-secret-change-in-prod',
      ),
    });
  }

  validate(payload: JwtPayload) {
    return {
      sub: payload.sub,
      id: payload.id,
      email: payload.email,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
