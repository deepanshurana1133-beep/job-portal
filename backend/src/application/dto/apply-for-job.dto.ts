import { IsMongoId } from 'class-validator';

export class ApplyForJobDto {
  @IsMongoId()
  jobId: string;
}
