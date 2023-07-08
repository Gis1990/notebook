import request from 'supertest';
import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import { RegistrationDto } from '../../src/modules/auth/dto/registration.dto';
import { ViewUser } from '../../src/modules/auth/entities/user-view.schema';
import { LoginDto } from '../../src/modules/auth/dto/login.dto';
import { ErrorResponse } from '../../src/modules/auth/dto/response-dto/errors.response';
import { TLoginResponse } from '../types/login.response';
import { TestResponse } from '../types/test-response';

export class AuthRequest {
  constructor(private readonly server: any) {}

  async registrationUser(
    registrationUserDto: RegistrationDto,
  ): Promise<TestResponse<ViewUser>> {
    const response = await request(this.server)
      .post('/auth/registration')
      .send(registrationUserDto);
    return { body: response.body, status: response.status };
  }

  async loginUser(loginUserDto: LoginDto): Promise<Partial<TLoginResponse>> {
    const response = await request(this.server)
      .post('/auth/login')
      .set('User-Agent', faker.internet.userAgent())
      .send(loginUserDto);

    if (response.status !== HttpStatus.OK) {
      return {
        status: response.status,
      };
    }

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.headers['set-cookie'][0]
        .split(';')[0]
        .split('=')[1],
      status: response.status,
    };
  }

  async confirmRegistration(
    code: string,
  ): Promise<TestResponse<ErrorResponse>> {
    const response = await request(this.server).post(
      `/auth/registration-confirmation?confirmationCode=${code}`,
    );

    return { body: response.body, status: response.status };
  }
}
