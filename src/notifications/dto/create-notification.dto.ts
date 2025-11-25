import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';

export class NotificationDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  type?: string;

  @IsString()
  message?: string;

  @IsNotEmpty()
  @IsBoolean()
  isRead: boolean;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsDate()
  readAt?: Date;
}
