import { ArgumentsHost, BadRequestException, Logger } from '@nestjs/common';
import { SafeHttpExceptionFilter } from './safe-http-exception.filter';

describe('SafeHttpExceptionFilter', () => {
  let filter: SafeHttpExceptionFilter;
  let response: { status: jest.Mock; json: jest.Mock };

  beforeEach(() => {
    filter = new SafeHttpExceptionFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createHost = () =>
    ({
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({
          method: 'GET',
          route: { path: '/test' },
        }),
      }),
    }) as ArgumentsHost;

  it('returns a generic message for unexpected server errors', () => {
    filter.catch(
      new Error('mongodb://user:password@database:27017/secret'),
      createHost(),
    );

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
    });
  });

  it('preserves safe client error messages without arbitrary response fields', () => {
    filter.catch(
      new BadRequestException({
        message: ['email must be valid'],
        error: 'Bad Request',
        stack: 'must not be exposed',
      }),
      createHost(),
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: ['email must be valid'],
      error: 'Bad Request',
    });
  });

  it('replaces sensitive client error messages with a generic status message', () => {
    filter.catch(
      new BadRequestException(
        'Database connection failed: mongodb://admin:secret@db:27017/jobs',
      ),
      createHost(),
    );

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'BAD_REQUEST',
      error: 'Bad Request',
    });
  });
});
