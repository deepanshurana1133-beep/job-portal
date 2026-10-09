import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { JobDocument } from './schemas/job.schema';
import { JobService } from './job.service';
import { ApplicationDocument } from '../application/schemas/application.schema';

describe('JobService ownership', () => {
  let service: JobService;
  let model: {
    findOneAndUpdate: jest.Mock;
    findOneAndDelete: jest.Mock;
    findOne: jest.Mock;
  };
  let applicationModel: { countDocuments: jest.Mock };
  let query: {
    exec: jest.Mock;
    select: jest.Mock;
  };

  beforeEach(() => {
    query = { exec: jest.fn(), select: jest.fn() };
    query.select.mockReturnValue(query);
    model = {
      findOneAndUpdate: jest.fn().mockReturnValue(query),
      findOneAndDelete: jest.fn().mockReturnValue(query),
      findOne: jest.fn().mockReturnValue(query),
    };
    applicationModel = {
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
    };
    service = new JobService(
      model as unknown as Model<JobDocument>,
      applicationModel as unknown as Model<ApplicationDocument>,
    );
  });

  it('restricts job updates to the owning recruiter', async () => {
    const job = { _id: 'job-id' };
    query.exec.mockResolvedValue(job);

    await expect(
      service.updateJob('507f1f77bcf86cd799439011', 'recruiter-id', {
        title: 'Updated title',
      }),
    ).resolves.toBe(job);

    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: '507f1f77bcf86cd799439011', recruiterId: 'recruiter-id' },
      { $set: { title: 'Updated title' } },
      { new: true, runValidators: true },
    );
  });

  it('does not delete a job owned by another recruiter', async () => {
    model.findOne.mockReturnValue(query);
    query.exec.mockResolvedValue(null);

    await expect(
      service.deleteJob('507f1f77bcf86cd799439011', 'recruiter-id'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(model.findOne).toHaveBeenCalledWith({
      _id: '507f1f77bcf86cd799439011',
      recruiterId: 'recruiter-id',
    });
    expect(model.findOneAndDelete).not.toHaveBeenCalled();
  });

  it('preserves jobs that already have applications', async () => {
    query.exec.mockResolvedValue({ _id: 'job-id' });
    applicationModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });

    await expect(
      service.deleteJob('507f1f77bcf86cd799439011', 'recruiter-id'),
    ).rejects.toThrow('This job has applications and cannot be deleted');
    expect(model.findOneAndDelete).not.toHaveBeenCalled();
  });
});
