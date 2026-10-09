import {
  IsArray,
  IsNotEmpty,
  IsString,
  ArrayMaxSize,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  company: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  location: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(10000)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  salary: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  jobType: string;

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  skills: string[];
}