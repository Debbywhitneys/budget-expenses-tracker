import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDate,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BudgetType } from '../entities/budget.entity';

export class CreateBudgetDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsOptional()
  category_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsEnum(BudgetType)
  @IsNotEmpty()
  period: BudgetType;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  alertThreshold?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
