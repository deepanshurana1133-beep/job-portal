import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

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
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
