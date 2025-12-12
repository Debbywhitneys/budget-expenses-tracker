import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JWTPayload = {
  sub: number; // user id (numeric)
  email: string;
  role: string;
};

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access-token') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      ignoreExpiration: false,
    });
  }

  validate(payload: JWTPayload) {
    return {
      user_id: payload.sub, // attaches to req.user
      email: payload.email,
      role: payload.role,
    };
  }
}
