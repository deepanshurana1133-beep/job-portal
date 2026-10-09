import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { EmailModule } from '../email/email.module';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { Job, JobSchema } from '../job/schemas/job.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Application.name,
        schema: ApplicationSchema,
      },
      {
        name: Job.name,
        schema: JobSchema,
      },
    ]),
    EmailModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
