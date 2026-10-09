import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobController } from './job.controller';
import { JobService } from './job.service';
import { Job, JobSchema } from './schemas/job.schema';
import { Application, ApplicationSchema } from '../application/schemas/application.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Job.name,
        schema: JobSchema,
      },
      {
        name: Application.name,
        schema: ApplicationSchema,
      },
    ]),
  ],
  controllers: [JobController],
  providers: [JobService],
})
export class JobModule {}
