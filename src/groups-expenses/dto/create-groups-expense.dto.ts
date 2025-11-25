import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { split_method } from '../entities/groups-expense.entity';

export class CreateGroupExpenseDto {
  @IsString()
  @IsNotEmpty()
  group_id: number;

  @IsNumber()
  @IsNotEmpty()
  paidBy: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  category_id: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  expenseDate: Date;
  @IsString()
  @IsOptional()
  receipt_url?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(split_method)
  @IsNotEmpty()
  split_method: split_method;

  @IsBoolean()
  @IsOptional()
  isSettled?: boolean;
}
