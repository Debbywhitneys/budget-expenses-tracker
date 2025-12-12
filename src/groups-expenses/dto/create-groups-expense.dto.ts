import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsBoolean,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { split_method } from '../entities/groups-expense.entity';

// Interface for expense members with split information
export class ExpenseMemberDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  percentage?: number;
}

export class CreateGroupExpenseDto {
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @IsNumber()
  @IsNotEmpty()
  paid_by_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  total_amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsNumber()
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

// Extended DTO with members for creating group expenses
export class CreateGroupExpenseWithMembersDto extends CreateGroupExpenseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseMemberDto)
  members: ExpenseMemberDto[];
}
