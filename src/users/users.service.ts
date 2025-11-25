import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      if (!createUserDto.email || !createUserDto.passwordHash) {
        throw new BadRequestException('Email and password are required');
      }

      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.passwordHash, 10);

      const user = this.userRepository.create({
        fullName: createUserDto.fullName,
        email: createUserDto.email.toLowerCase(),
        phoneNumber: createUserDto.phoneNumber,
        currency: createUserDto.currency || 'USD',
        timezone: createUserDto.timezone || 'UTC',
        // Add system admin flag
        isSystemAdmin: createUserDto.isSystemAdmin || false,
      });

      const savedUser = await this.userRepository.save(user);

      return savedUser;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        `Failed to create user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          currency: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
          isSystemAdmin: true, // include system admin flag
        },
        order: {
          createdAt: 'DESC',
        },
      });
    } catch (error) {
      throw new HttpException(
        'Error finding users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          currency: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
          isSystemAdmin: true, // include system admin flag
        },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error while finding user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });
    } catch (error) {
      throw new HttpException(
        'Error while finding user by email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id } });

      if (!existingUser)
        throw new NotFoundException(`User with id ${id} not found`);

      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        const emailExists = await this.userRepository.findOne({
          where: { email: updateUserDto.email.toLowerCase() },
        });

        if (emailExists) throw new ConflictException('Email already in use');

        updateUserDto.email = updateUserDto.email.toLowerCase();
      }

      if (updateUserDto.passwordHash) {
        updateUserDto.passwordHash = await bcrypt.hash(
          updateUserDto.passwordHash,
          10,
        );
      }

      // Update system admin only if provided
      if (updateUserDto.isSystemAdmin !== undefined) {
        updateUserDto.isSystemAdmin = updateUserDto.isSystemAdmin;
      }

      await this.userRepository.update(id, updateUserDto);

      const updatedUser = await this.findOne(id);
      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      throw new HttpException(
        'Error while updating the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser)
        throw new NotFoundException(`User with id ${id} not found`);

      await this.userRepository.delete(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error deleting the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) return null;

      return user;
    } catch (error) {
      throw new HttpException(
        'Error validating credentials',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
