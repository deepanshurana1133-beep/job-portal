import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { ApplicationModule } from './application/application.module';
@Module({
  imports: [
  MongooseModule.forRoot('mongodb://127.0.0.1:27017/job_portal'),
  UserModule,
  AuthModule,
  JobModule,
  ApplicationModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
