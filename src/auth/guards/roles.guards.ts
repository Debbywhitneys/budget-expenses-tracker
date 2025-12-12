import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, userRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Request } from 'express';

interface AuthUser {
  id: number;
  email: string;
  userRole: userRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<userRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no role requirement, allow access
    if (!requiredRoles) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthUser }>();
    const user = request.user;

    // User must exist (from JWT validation)
    if (!user) return false;

    const verifiedUser = await this.userRepository.findOne({
      where: { user_id: user.id },
      select: ['user_id', 'email', 'userRole'],
    });

    if (!verifiedUser) return false;

    // SYSTEM ADMIN OVERRIDE — has access to everything
    if (verifiedUser.userRole === userRole.SYSTEM_ADMIN) {
      return true;
    }

    // Normal role-based access check
    return requiredRoles.includes(verifiedUser.userRole);
  }
}
