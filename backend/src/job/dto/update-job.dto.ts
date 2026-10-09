import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  company?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  salary?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  jobType?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  skills?: string[];
}
