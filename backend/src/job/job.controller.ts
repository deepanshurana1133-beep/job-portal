import { Body, Controller, Delete, Post, Get, Param, Patch, Req, UseGuards} from '@nestjs/common';

import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}
  @Post()
@UseGuards(JwtAuthGuard)
createJob(
  @Body() createJobDto: CreateJobDto,
  @Req() req: any,
) {
  return this.jobService.createJob(createJobDto, req.user.userId);
}

  @Get()
getAllJobs() {
  return this.jobService.getAllJobs();
}
@Get('recruiter')
@UseGuards(JwtAuthGuard)
getRecruiterJobs(@Req() req: any) {
  return this.jobService.getRecruiterJobs(req.user.userId);
}

@Get(':id')
getJobById(@Param('id') id: string) {
  return this.jobService.getJobById(id);
}
@Patch(':id')
updateJob(
  @Param('id') id: string,
  @Body() updateJobDto: any,
) {
  return this.jobService.updateJob(id, updateJobDto);
}
@Delete(':id')
deleteJob(@Param('id') id: string) {
  return this.jobService.deleteJob(id);
}
}
