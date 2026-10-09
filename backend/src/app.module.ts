import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JobModule } from './job/job.module';
import { ApplicationModule } from './application/application.module';
import { SafeHttpExceptionFilter } from './common/filters/safe-http-exception.filter';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        if (
          typeof config.JWT_SECRET !== 'string' ||
          config.JWT_SECRET.length < 32
        ) {
          throw new Error(
            'JWT_SECRET must be configured with at least 32 characters',
          );
        }

        return config;
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/job_portal'),
    UserModule,
    AuthModule,
    JobModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: SafeHttpExceptionFilter,
    },
  ],
})
export class AppModule {}
