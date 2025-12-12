import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class RefreshTokenGuard extends AuthGuard('refresh') {
  // override the request extraction from the context
  getRequest(context: ExecutionContext) {
    const request = super.getRequest(context) as Request & {
      cookies: { refreshToken: string };
    };
    return request;
  }
}
