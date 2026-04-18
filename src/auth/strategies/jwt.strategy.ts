import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../common/enums/user-role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
  status: UserStatus;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET', 'dev-access-secret'),
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
      status: payload.status,
    };
  }
}