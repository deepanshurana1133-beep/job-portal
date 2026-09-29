import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { EmailModule } from '../email/email.module';
import {
  Application,
  ApplicationSchema,
} from './schemas/application.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Application.name,
        schema: ApplicationSchema,
      },
    ]),
    EmailModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
