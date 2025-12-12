import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';
import { split_method } from '../../groups-expenses/entities/groups-expense.entity';

export class CreateGroupExpenseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  total_amount: number;

  @IsString()
  currency: string;

  @IsNumber()
  @IsOptional()
  category_id?: number;

  @IsEnum(split_method)
  split_method: split_method;

  @IsDateString()
  expense_date: string;

  @IsString()
  @IsOptional()
  receipt_url?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  members: number[];
}
