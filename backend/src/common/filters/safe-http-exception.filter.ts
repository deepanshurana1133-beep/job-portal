import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class SafeHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SafeHttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Unhandled server error for ${request.method} ${request.route?.path ?? 'unmatched route'}`,
        exception instanceof Error ? exception.stack : undefined,
      );
      response.status(status).json({
        statusCode: status,
        message: 'Internal server error',
      });
      return;
    }

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : undefined;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : this.getSafeMessage(exceptionResponse, status);
    const errorMessage =
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'error' in exceptionResponse &&
      typeof exceptionResponse.error === 'string'
        ? exceptionResponse.error
        : undefined;
    const error = errorMessage
      ? this.removeSensitiveDetails(errorMessage, status)
      : undefined;

    response.status(status).json({
      statusCode: status,
      message: this.removeSensitiveDetails(message, status),
      ...(error ? { error } : {}),
    });
  }

  private getSafeMessage(
    exceptionResponse: unknown,
    status: number,
  ): string | string[] {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse &&
      (typeof exceptionResponse.message === 'string' ||
        (Array.isArray(exceptionResponse.message) &&
          exceptionResponse.message.every((item) => typeof item === 'string')))
    ) {
      return exceptionResponse.message;
    }

    return HttpStatus[status] ?? 'Request failed';
  }

  private removeSensitiveDetails(
    message: string | string[],
    status: number,
  ): string | string[] {
    const messages = Array.isArray(message) ? message : [message];
    const containsSensitiveDetails = messages.some((item) =>
      /(?:mongodb(?:\+srv)?:\/\/|postgres(?:ql)?:\/\/|mysql:\/\/|redis:\/\/|(?:password|passwd|secret|token|api[_-]?key|database|connection[_-]?string)\s*[:=]|\bat\s.+\(.+:\d+:\d+\))/i.test(
        item,
      ),
    );

    if (containsSensitiveDetails) {
      return HttpStatus[status] ?? 'Request failed';
    }

    return message;
  }
}
