import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  createJob(
    @Body() createJobDto: CreateJobDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.jobService.createJob(createJobDto, req.user.userId);
  }

  @Get()
  getAllJobs() {
    return this.jobService.getAllJobs();
  }

  @Get('recruiter')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  getRecruiterJobs(@Req() req: { user: { userId: string } }) {
    return this.jobService.getRecruiterJobs(req.user.userId);
  }

  @Get(':id')
  getJobById(@Param('id') id: string) {
    return this.jobService.getJobById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  updateJob(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.jobService.updateJob(id, updateJobDto, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('recruiter')
  deleteJob(@Param('id') id: string, @Req() req: { user: { userId: string } }) {
    return this.jobService.deleteJob(id, req.user.userId);
  }
}
