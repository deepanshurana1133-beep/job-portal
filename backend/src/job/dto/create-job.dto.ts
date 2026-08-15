import {
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  salary: string;

  @IsString()
  @IsNotEmpty()
  jobType: string;

  @IsArray()
  skills: string[];

}