import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FinancialGoaltype } from '../entities/financial-goal.entity';
import { priority } from '../entities/financial-goal.entity';

export class CreateFinancialGoalDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  targetAmount: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  currentAmount?: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  deadline?: Date;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(FinancialGoaltype)
  @IsNotEmpty()
  FinancialGoaltype: FinancialGoaltype;

  @IsEnum(priority)
  @IsOptional()
  priority?: priority;

  @IsBoolean()
  @IsOptional()
  isAchieved?: boolean;
}
