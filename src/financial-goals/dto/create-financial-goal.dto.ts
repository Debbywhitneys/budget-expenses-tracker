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
import { FinancialGoalType } from '../entities/financial-goal.entity';
import { priority } from '../entities/financial-goal.entity';

export class CreateFinancialGoalDto {
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

  @IsEnum(FinancialGoalType)
  @IsOptional()
  financialGoalType?: FinancialGoalType;

  @IsEnum(priority)
  @IsOptional()
  priority?: priority;

  @IsBoolean()
  @IsOptional()
  isAchieved?: boolean;
}
