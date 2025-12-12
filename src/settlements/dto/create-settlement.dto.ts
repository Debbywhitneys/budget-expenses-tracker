import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsDate,
  MaxLength,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSettlementDto {
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @IsNumber()
  @IsNotEmpty()
  payer_id: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;
}
