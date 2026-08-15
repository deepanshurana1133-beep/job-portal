import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  company: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  salary: string;

  @Prop({ required: true })
  jobType: string;

  @Prop({ required: true })
  skills: [string];

  @Prop({ required: true })
  recruiterId: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);