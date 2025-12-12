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
import { User, userRole } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // =====================================
  // CREATE USER
  // =====================================
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      if (!createUserDto.email || !createUserDto.password) {
        throw new BadRequestException('Email and password are required');
      }

      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = this.userRepository.create({
        fullName: createUserDto.fullName,
        email: createUserDto.email.toLowerCase(),
        phoneNumber: createUserDto.phoneNumber,
        currency: createUserDto.currency || 'USD',
        timezone: createUserDto.timezone || 'UTC',
        passwordHash: hashedPassword,
        userRole: createUserDto.userRole || userRole.USER,
        profilePictureUrl: createUserDto.profilePictureUrl,
      });

      return await this.userRepository.save(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to create user: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================
  // FIND ALL USERS
  // =====================================
  async findAll(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        select: {
          user_id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          currency: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
          userRole: true,
          profilePictureUrl: true,
        },
        order: { createdAt: 'DESC' },
      });

      return users;
    } catch {
      throw new HttpException(
        'Error finding users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================
  // FIND ONE BY ID
  // =====================================
  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: id },
        select: {
          user_id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          currency: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
          userRole: true,
          profilePictureUrl: true,
        },
      });

      if (!user) throw new NotFoundException(`User with id ${id} not found`);

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error while finding user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================
  // FIND BY EMAIL
  // =====================================
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email: email.toLowerCase() },
      });
    } catch {
      throw new HttpException(
        'Error finding user by email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================
  // UPDATE USER
  // =====================================
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const existing = await this.userRepository.findOne({
        where: { user_id: id },
      });
      if (!existing)
        throw new NotFoundException(`User with id ${id} not found`);

      // Validate email update
      if (updateUserDto.email && updateUserDto.email !== existing.email) {
        const emailExists = await this.userRepository.findOne({
          where: { email: updateUserDto.email.toLowerCase() },
        });
        if (emailExists) throw new ConflictException('Email already in use');

        updateUserDto.email = updateUserDto.email.toLowerCase();
      }

      // Prepare update data
      const { password, ...updateDataWithoutPassword } = updateUserDto;
      const updateData: Partial<User> & { passwordHash?: string } = {
        ...updateDataWithoutPassword,
      };

      // Hash password if being changed
      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      // Role update
      if (updateUserDto.userRole) {
        // validate role value before updating
        if (!Object.values(userRole).includes(updateUserDto.userRole)) {
          throw new BadRequestException('Invalid user role');
        }
      }

      await this.userRepository.update({ user_id: id }, updateData);

      return await this.findOne(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new HttpException(
        'Error while updating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================
  // DELETE USER
  // =====================================
  async remove(id: number): Promise<{ message: string }> {
    try {
      const existing = await this.userRepository.findOne({
        where: { user_id: id },
      });
      if (!existing)
        throw new NotFoundException(`User with id ${id} not found`);

      await this.userRepository.delete({ user_id: id });

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error deleting user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // =====================================
  // CREDENTIAL VALIDATION
  // =====================================
  async validateCredentials(
    email: string,
    passwordHash: string,
  ): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) return null;

      const isValid = await bcrypt.compare(passwordHash, user.passwordHash);
      return isValid ? user : null;
    } catch {
      throw new HttpException(
        'Error validating credentials',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
