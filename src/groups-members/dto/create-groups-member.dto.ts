import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroupMemberDto {
  @IsString()
  @IsNotEmpty()
  group_id: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  joinedAt: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
