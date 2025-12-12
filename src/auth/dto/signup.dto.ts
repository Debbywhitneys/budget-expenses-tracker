import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { userRole } from '../../users/entities/user.entity';

export class CreateAuthDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string; // Will be hashed → stored as passwordHash

  @ApiProperty({ example: 'tiffany_nyawira' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'Tiffany Nyawira' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ example: 'user', required: false })
  @IsString()
  userRole?: userRole;

  @ApiProperty({ example: 'KES', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'Africa/Nairobi', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}
