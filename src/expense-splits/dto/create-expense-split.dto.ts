import {
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRecurringSplitDto {
  @IsNumber()
  @IsOptional()
  group_expense_id?: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amountOwed: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amountPaid?: number;

  @IsBoolean()
  @IsOptional()
  isSettled?: boolean;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  settled_at?: Date;
}
