import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ApplicationDocument = HydratedDocument<Application>;

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
  jobId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  resume: string;

  @Prop({
    required: true,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  })
  status: string;
}

export const ApplicationSchema =
  SchemaFactory.createForClass(Application);