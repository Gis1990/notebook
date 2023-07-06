import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './http.exception.filter';

export const validationPipeSettings = {
  transform: true,
  stopAtFirstError: true,
  exceptionFactory: (errors) => {
    const errorsForResponse = [];
    errors.forEach((e) => {
      const constraintsKeys = Object.keys(e.constraints);
      constraintsKeys.forEach((key) => {
        errorsForResponse.push({
          message: e.constraints[key],
          field: e.property,
        });
      });
    });
    throw new BadRequestException(errorsForResponse);
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(validationPipeSettings));
  app.useGlobalFilters(new HttpExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  const port = configService.get<number>('MAIN_PORT');
  const serverUrl = `http://localhost:${port}`;

  await app.listen(port, () => {
    console.log(`Application started on ${serverUrl}`);
    console.log(`Swagger documentation on ${serverUrl}/swagger`);
  });
}

bootstrap();
