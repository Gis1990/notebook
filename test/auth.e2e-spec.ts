import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Requests } from './requests/requests';
import cookieParser from 'cookie-parser';
import { RegistrationDto } from '../src/modules/auth/dto/registration.dto';
import { TestingRepository } from '../src/repositories/testing.repository';
import { EmailManager } from '../src/adapters/email.adapter';
import { EmailManagerMock } from './mock/email-adapter.mock';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/http.exception.filter';
import { errorsMessage } from './response/error.response';
import {
  preparedLoginData,
  preparedRegistrationData,
} from './prepared-data/prepared-user.data';
import { createUserResponse } from './response/auth/create-user.response';
import { PrismaService } from '../prisma/prisma.service';
import { useContainer } from 'class-validator';

const validationPipeSettingsForTest = {
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

describe('Test auth controller.', () => {
  let app: INestApplication;
  let server;
  let requests: Requests;
  let testingRepository: TestingRepository;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [PrismaService],
    })
      .overrideProvider(EmailManager)
      .useValue(new EmailManagerMock())
      .compile();
    app = await moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe(validationPipeSettingsForTest));
    app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    testingRepository = app.get(TestingRepository);
    server = await app.getHttpServer();
    requests = new Requests(server);
    prismaService = moduleFixture.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Create new user', () => {
    it('Clear data base.', async () => {
      await testingRepository.deleteAll();
    });

    const errors = errorsMessage<RegistrationDto>(['email', 'password']);
    it(`Status ${HttpStatus.BAD_REQUEST}. Try registration with SHORT input data.`, async () => {
      const response = await requests
        .auth()
        .registrationUser(preparedRegistrationData.incorrect.short);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual(errors);
    });

    it(`Status ${HttpStatus.BAD_REQUEST}. Try registration with LONG input data.`, async () => {
      const response = await requests
        .auth()
        .registrationUser(preparedRegistrationData.incorrect.long);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toStrictEqual(errors);
    });

    it(`Status ${HttpStatus.CREATED}. Should create new user.`, async () => {
      const response = await requests
        .auth()
        .registrationUser(preparedRegistrationData.valid);
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(
        createUserResponse(preparedRegistrationData.valid.email),
      );
    });
    describe('Registration confirmation.', () => {
      it('Create data.', async () => {
        await testingRepository.deleteAll();
        const user = await requests
          .auth()
          .registrationUser(preparedRegistrationData.valid);
        const createdUser = await testingRepository.getUser(user.body.id);
        expect.setState({
          userId: user.body.id,
          code: createdUser.EmailConfirmation.confirmationCode,
        });
      });

      it(`Status ${HttpStatus.BAD_REQUEST}. Try confirm email with incorrect code.`, async () => {
        const { code } = expect.getState();
        const response = await requests
          .auth()
          .confirmRegistration((Number(code) - 1).toString());
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      });

      it(`Status ${HttpStatus.NO_CONTENT}. Registration confirm.`, async () => {
        const { userId, code } = expect.getState();

        const response = await requests.auth().confirmRegistration(code);
        expect(response.status).toBe(HttpStatus.NO_CONTENT);

        const user = await testingRepository.getUser(userId);
        const isUserConfirmed = user.isUserConfirmed;
        expect(isUserConfirmed).toBe(true);
      });

      describe('Log user', () => {
        it('Create data.', async () => {
          await testingRepository.deleteAll();
          const user = await requests
            .auth()
            .registrationUser(preparedRegistrationData.valid);
          const createdUser = await testingRepository.getUser(user.body.id);

          expect.setState({
            userId: user.body.id,
            code: createdUser.EmailConfirmation.confirmationCode,
          });
        }, 10000);

        it(`Status ${HttpStatus.UNAUTHORIZED}. User tries to log in without confirming the email.`, async () => {
          const response = await requests.auth().loginUser({
            email: preparedLoginData.valid.email,
            password: preparedLoginData.valid.password,
          });

          expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });

        it(`Status ${HttpStatus.UNAUTHORIZED}. User try login with incorrect email.`, async () => {
          const { code } = expect.getState();
          await requests.auth().confirmRegistration(code);
          const response = await requests.auth().loginUser({
            email: preparedLoginData.incorrect.email,
            password: preparedLoginData.valid.password,
          });
          expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });

        it(`Status ${HttpStatus.UNAUTHORIZED}. User try login with incorrect password.`, async () => {
          const response = await requests.auth().loginUser({
            email: preparedLoginData.valid.email,
            password: preparedLoginData.incorrect.password,
          });
          expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
        });

        it(`Status ${HttpStatus.OK}. Should return access and refresh JWT tokens. `, async () => {
          const { userId } = expect.getState();
          const response = await requests
            .auth()
            .loginUser(preparedLoginData.valid);
          expect(response.status).toBe(HttpStatus.NO_CONTENT);
          const loggedUser = await testingRepository.getUser(userId);
          const response2 = await requests.auth().confirmLogin({
            email: loggedUser.email,
            codeForLogin: loggedUser.EmailConfirmation.codeForLogin,
          });
          expect(response2.status).toBe(HttpStatus.OK);
          expect(response2.refreshToken).toBeTruthy();
          expect.setState({
            userId: loggedUser.id,
            accessToken: response2.accessToken,
          });
        });

        it(`Status ${HttpStatus.NO_CONTENT}. Should give sa permission to user `, async () => {
          const { userId } = expect.getState();
          const { accessToken } = expect.getState();
          const response = await requests
            .auth()
            .giveUserSuperAdminPermission(accessToken);
          expect(response.status).toBe(HttpStatus.NO_CONTENT);
          const loggedUser = await testingRepository.getUser(userId);
          expect(loggedUser.isUserSuperAdmin).toBeTruthy();
        });
      });
    });
  });
});
