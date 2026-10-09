import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

import type { Request, Response } from 'express';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Throttle } from '@nestjs/throttler';
import { ApplyForJobDto } from './dto/apply-for-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { UserRole } from '../auth/roles';
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('job_seeker')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'resumes');
          fs.mkdirSync(uploadPath, { recursive: true });
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          callback(null, `${randomUUID()}.pdf`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (file.mimetype === 'application/pdf') {
          callback(null, true);
        } else {
          callback(
            new BadRequestException('Only PDF files are allowed'),
            false,
          );
        }
      },
    }),
  )
  applyForJob(
    @Body() body: ApplyForJobDto,
    @UploadedFile() file: { filename: string } | undefined,
    @Req() req: Request,
  ) {
    const user = req.user as {
      userId: string;
      email: string;
      role: UserRole;
    };

    if (!file) {
      throw new BadRequestException('A PDF resume is required');
    }

    return this.applicationService.applyForJob(
      body.jobId,
      user.userId,
      file.filename,
    );
  }

  @Get('my')
  getMyApplications(@Req() req: Request) {
    const user = req.user as {
      userId: string;
      email: string;
      role: UserRole;
    };

    return this.applicationService.getMyApplications(user.userId);
  }

  @Get('recruiter')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  getRecruiterApplications(@Req() req: Request) {
    const user = req.user as {
      userId: string;
      email: string;
      role: UserRole;
    };

    return this.applicationService.getRecruiterApplications(user.userId);
  }

  @Get(':id/resume')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  viewResume(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user as {
      userId: string;
      email: string;
      role: UserRole;
    };

    return this.applicationService.viewResume(id, user.userId, user.role, res);
  }

  @Get(':id')
  getApplicationById(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as {
      userId: string;
      email: string;
      role: UserRole;
    };

    return this.applicationService.getApplicationById(
      id,
      user.userId,
      user.role,
    );
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('recruiter')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateApplicationStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as {
      userId: string;
      email: string;
      role: UserRole;
    };

    return this.applicationService.updateStatus(
      id,
      body.status,
      user.userId,
      user.role,
    );
  }
}
