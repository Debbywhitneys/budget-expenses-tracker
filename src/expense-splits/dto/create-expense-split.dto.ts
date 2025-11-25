import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateRecurringSplitDto {
  @IsNumber()
  @IsOptional()
  groupExpenseId?: number;

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

  @IsString()
  @IsOptional()
  settled_at?: Date;
}
