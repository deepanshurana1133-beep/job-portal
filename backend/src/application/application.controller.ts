import {
  BadRequestException,
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
import { randomUUID } from 'crypto';
import type { File as MulterFile } from 'multer';

import type { Request, Response } from 'express';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ApplyForJobDto } from './dto/apply-for-job.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('job_seeker')
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
          callback(null, `${randomUUID()}.pdf`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
      fileFilter: (req, file, callback) => {
        const isPdfType = file.mimetype === 'application/pdf';
        const hasPdfExtension = path.extname(file.originalname).toLowerCase() === '.pdf';
        callback(null, isPdfType && hasPdfExtension);
      },
    }),
  )
  async applyForJob(
    @Body() applyDto: ApplyForJobDto,
    @UploadedFile() file: MulterFile | undefined,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('A PDF resume is required');
    }

    const user = req.user as { userId: string };
    try {
      const fileBytes = await fs.promises.readFile(file.path);
      const pdfSignature = fileBytes.subarray(0, 5).toString();
      if (pdfSignature !== '%PDF-') {
        throw new BadRequestException('Uploaded file is not a valid PDF');
      }

      return await this.applicationService.applyForJob(
        applyDto.jobId,
        user.userId,
        file.filename,
      );
    } catch (error) {
      await this.removeUploadedFile(file.path);
      throw error;
    }
  }

  private async removeUploadedFile(filePath: string): Promise<void> {
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      if (
        !error ||
        typeof error !== 'object' ||
        !('code' in error) ||
        error.code !== 'ENOENT'
      ) {
        console.error('Failed to remove an invalid or unused resume upload');
      }
    }
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('job_seeker')
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
  @UseGuards(RolesGuard)
  @Roles('job_seeker')
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
  @Body() updateStatusDto: UpdateApplicationStatusDto,
  @Req() req: Request,
) {
  const user = req.user as {
    userId: string;
    email: string;
    role: string;
  };

  return this.applicationService.updateStatus(
    id,
    updateStatusDto.status,
    user.userId,
    user.role,
  );
}
}
