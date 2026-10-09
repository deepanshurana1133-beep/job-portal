import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Job } from './schemas/job.schema';
import { JobService } from './job.service';

describe('JobService', () => {
  let service: JobService;
  const jobModel = {
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: getModelToken(Job.name),
          useValue: jobModel,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    jest.clearAllMocks();
  });

  it('scopes job updates to the authenticated recruiter', async () => {
    const id = '507f1f77bcf86cd799439011';
    const recruiterId = '507f191e810c19729de860ea';
    const update = { title: 'Updated title' };
    jobModel.findOneAndUpdate.mockResolvedValue({ _id: id, ...update });

    await service.updateJob(id, update, recruiterId);

    expect(jobModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: id, recruiterId },
      { $set: update },
      { new: true, runValidators: true },
    );
  });

  it('scopes job deletion to the authenticated recruiter', async () => {
    const id = '507f1f77bcf86cd799439011';
    const recruiterId = '507f191e810c19729de860ea';
    jobModel.findOneAndDelete.mockResolvedValue({ _id: id });

    await service.deleteJob(id, recruiterId);

    expect(jobModel.findOneAndDelete).toHaveBeenCalledWith({
      _id: id,
      recruiterId,
    });
  });
});
