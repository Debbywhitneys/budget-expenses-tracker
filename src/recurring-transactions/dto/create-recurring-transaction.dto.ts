import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
  IsOptional,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { recurringTransactionType } from '../entities/recurring-transaction.entity';
import { frequency } from '../entities/recurring-transaction.entity';

export class CreateRecurringTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsEnum(recurringTransactionType)
  type: recurringTransactionType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(frequency)
  frequency: frequency;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  nextOccurrenceDate: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @IsNotEmpty()
  @IsNumber()
  category_id: number;
}
