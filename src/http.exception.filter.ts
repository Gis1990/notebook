import {
  Catch,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();
    if (status === 401) {
      response.sendStatus(status);
      return;
    }
    if (status === 404) {
      response.sendStatus(status);
      return;
    }
    if (status === 403) {
      response.sendStatus(status);
      return;
    }
    if (status === 400 || Array.isArray(responseBody.message)) {
      const errorResponse = {
        errors: [],
      };
      const result = [];
      const responseBody: any = exception.getResponse();
      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((error) => {
          const isDuplicate = result.some(
            (resultError) => resultError.field === error.field,
          );
          if (!isDuplicate) {
            result.push(error);
          }
        });
        result.forEach((m) =>
          errorResponse.errors.push({
            message: m.message,
            field: m.field,
          }),
        );
      } else {
        const [field, message] = responseBody.message.split(':');
        errorResponse.errors.push({
          message,
          field,
        });
      }
      response.status(status).json(errorResponse);
      return;
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
    return;
  }
}
