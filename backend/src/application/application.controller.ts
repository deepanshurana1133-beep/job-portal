import {
  Body,
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

import {
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

import type { Request, Response } from 'express';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
  ) {}

  @Post()
@UseInterceptors(
  FileInterceptor('resume', {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const uploadPath = path.join(
          process.cwd(),
          'uploads',
          'resumes',
        );

        fs.mkdirSync(uploadPath, { recursive: true });

        callback(null, uploadPath);
      },

      filename: (req, file, callback) => {
        const uniqueName =
          `${Date.now()}-${file.originalname}`;

        callback(null, uniqueName);
      },
    }),

    fileFilter: (req, file, callback) => {
      if (file.mimetype === 'application/pdf') {
        callback(null, true);
      } else {
        callback(
          new Error('Only PDF files are allowed'),
          false,
        );
      }
    },
  }),
)
applyForJob(
  @Body('jobId') jobId: string,
  @UploadedFile() file: any,
  @Req() req: Request,
) {
  const user = req.user as {
    userId: string;
    email: string;
    role: string;
  };

  return this.applicationService.applyForJob(
    jobId,
    user.userId,
    file.filename,
  );
}
  @Get('my')
  getMyApplications(@Req() req: Request) {
    const user = req.user as {
      userId: string;
      email: string;
      role: string;
    };

    return this.applicationService.getMyApplications(
      user.userId,
    );
  }
  @Get('recruiter')
@UseGuards(RolesGuard)
@Roles('recruiter')
getRecruiterApplications(@Req() req: Request) {
  const user = req.user as {
    userId: string;
    email: string;
    role: string;
  };

  return this.applicationService.getRecruiterApplications(
    user.userId,
  );
}
@Get(':id/resume')
@UseGuards(RolesGuard)
@Roles('recruiter')
async viewResume(
  @Param('id') id: string,
  @Req() req: Request,
  @Res() res: Response,
) {
  const user = req.user as {
    userId: string;
    email: string;
    role: string;
  };

  return this.applicationService.viewResume(
    id,
    user.userId,
    user.role,
    res,
  );
}
  @Get(':id')
getApplicationById(
  @Param('id') id: string,
  @Req() req: Request,
) {
  const user = req.user as {
    userId: string;
    email: string;
    role: string;
  };

  return this.applicationService.getApplicationById(
    id,
    user.userId,
  );
}

  @Patch(':id/status')
@UseGuards(RolesGuard)
@Roles('recruiter')
updateStatus(
  @Param('id') id: string,
  @Body('status')
  status: 'Pending' | 'Accepted' | 'Rejected',
  @Req() req: Request,
) {
  const user = req.user as {
    userId: string;
    email: string;
    role: string;
  };

  return this.applicationService.updateStatus(
    id,
    status,
    user.userId,
    user.role,
  );
}
}
