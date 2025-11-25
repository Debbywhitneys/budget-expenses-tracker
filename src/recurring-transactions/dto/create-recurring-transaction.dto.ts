import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { recurringTransactionType } from '../entities/recurring-transaction.entity';
import { frequency } from '../entities/recurring-transaction.entity';

export class RecurringTransactionDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  amount?: string;

  @IsOptional()
  @IsNumber()
  category_id?: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(recurringTransactionType)
  type: recurringTransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(frequency)
  frequency: frequency; // daily | weekly | monthly | yearly

  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsDate()
  nextOccurrenceDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;
}
