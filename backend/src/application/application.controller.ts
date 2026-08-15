import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
  ) {}

  @Post()
@UseInterceptors(
  FileInterceptor('resume', {
    dest: './uploads/resumes',

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
  @UploadedFile() file: Express.Multer.File,
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
async getResume(
  @Param('id') id: string,
  @Res() res: Response,
) {
  const filename =
    await this.applicationService.getApplicationResume(id);

  const filePath = path.join(
    process.cwd(),
    'uploads',
    'resumes',
    filename,
  );

  console.log('Resume file:', filePath);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline');

  return res.sendFile(filePath, (error) => {
    if (error) {
      console.error('Resume send error:', error);

      if (!res.headersSent) {
        res.status(404).json({
          message: 'Resume file not found',
        });
      }
    }
  });
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
