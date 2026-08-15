import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Job, JobDocument } from './schemas/job.schema';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
  ) {}

  async createJob(createJobDto: CreateJobDto, recruiterId: string) {
  const job = new this.jobModel({
    ...createJobDto,
    recruiterId,
  });

  return job.save();
}
  async getAllJobs() {
  return this.jobModel.find().sort({ createdAt: -1 });
}
async getJobById(id: string) {
  return this.jobModel.findById(id);
}
async updateJob(id: string, updateJobDto: any) {
  return this.jobModel.findByIdAndUpdate(
    id,
    updateJobDto,
    { new: true },
  );
}
async deleteJob(id: string) {
  return this.jobModel.findByIdAndDelete(id);
}
async getRecruiterJobs(recruiterId: string) {
  return this.jobModel
    .find({ recruiterId })
    .sort({ createdAt: -1 });
}
}
