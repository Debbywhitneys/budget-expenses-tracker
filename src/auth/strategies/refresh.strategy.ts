import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

type JWTPayload = {
  sub: string;
  email: string;
};

interface PayloadWithRT extends JWTPayload {
  refreshToken: string;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JWTPayload): PayloadWithRT {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      throw new UnauthorizedException('No Authorization header found');
    }

    if (!authHeader.startsWith('Bearer')) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const token = authHeader.replace('Bearer', '').trim();

    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      refreshToken: token,
    };
  }
}
