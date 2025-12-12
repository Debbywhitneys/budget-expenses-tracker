import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../users/entities/user.entity';
import { CreateAuthDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  // ================================
  // Password + Refresh Token Helpers
  // ================================
  private async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashed = await this.hashData(refreshToken);

    await this.userRepository.update(
      { user_id: userId },
      { hashedRefreshedToken: hashed },
    );
  }

  // ================================
  // JWT Token Generator
  // ================================
  private generateTokens(user: User) {
    const payload = {
      sub: user.user_id,
      email: user.email,
      role: user.userRole,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: '2h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  // ================================
  // SIGN UP
  // ================================
  async SignUp(dto: CreateAuthDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashData(dto.password);

    const user = this.userRepository.create({
      ...dto,
      passwordHash: hashedPassword,
    });

    const saved = await this.userRepository.save(user);

    const { accessToken, refreshToken } = this.generateTokens(saved);

    await this.saveRefreshToken(saved.user_id, refreshToken);

    return {
      user: saved,
      accessToken,
      refreshToken,
    };
  }

  // ================================
  // SIGN IN
  // ================================
  async SignIn(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User with that email not found');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password 😒');
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    await this.saveRefreshToken(user.user_id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  // ================================
  // SIGN OUT
  // ================================
  async SignOut(userId: number) {
    const result = await this.userRepository.update(
      { user_id: userId },
      { hashedRefreshedToken: null },
    );

    if (!result.affected) {
      throw new NotFoundException('User not found');
    }

    return `User with id ${userId} signed out`;
  }
}
