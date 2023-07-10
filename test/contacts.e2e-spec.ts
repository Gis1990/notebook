import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Requests } from './requests/requests';
import cookieParser from 'cookie-parser';
import { TestingRepository } from '../src/repositories/testing.repository';
import { EmailManager } from '../src/adapters/email.adapter';
import { EmailManagerMock } from './mock/email-adapter.mock';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/http.exception.filter';
import { PrismaService } from '../prisma/prisma.service';
import { useContainer } from 'class-validator';
import {
  preparedContactData,
  preparedGetAllContactsData,
} from './prepared-data/prepared-contact.data';
import { errorsMessage } from './response/error.response';
import { CreateContactDto } from '../src/modules/contacts/dto/create-contact.dto';
import { createContactsResponse } from './response/contacts/create-contact.response';
import { readFileAsync } from '../utils/fs.utils';
import { join } from 'node:path';

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

describe('Test contact controller.', () => {
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
    await testingRepository.deleteAll();
    await prismaService.$disconnect();
    await app.close();
  });

  describe('Add new contact', () => {
    it('Clear data base.', async () => {
      await testingRepository.deleteAll();
    });

    it('Add new user.', async () => {
      const response = await requests.userFactory().createAndLoginUsers(1);
      expect.setState({
        accessToken: response[0].accessToken,
      });
    });

    it(`Status ${HttpStatus.UNAUTHORIZED}. Try create new contact with incorrect AccessToken.`, async () => {
      const response = await requests
        .contact()
        .createContact(preparedContactData.valid, 'IncorrectAccessToken');
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    const errors = errorsMessage<CreateContactDto>(['email']);
    it(`Status ${HttpStatus.BAD_REQUEST}. Try create new contact with incorrect email`, async () => {
      const { accessToken } = expect.getState();
      const response = await requests
        .contact()
        .createContact(preparedContactData.incorrect, accessToken);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toStrictEqual(errors);
    });

    it(`Status ${HttpStatus.CREATED}. Try create new contact with correct data`, async () => {
      const { accessToken } = expect.getState();
      const response = await requests
        .contact()
        .createContact(preparedContactData.valid, accessToken);
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(
        createContactsResponse(
          preparedContactData.valid.firstName,
          preparedContactData.valid.lastName,
          preparedContactData.valid.email,
          preparedContactData.valid.phoneNumber,
        ),
      );
    });
  });
  describe('Get all contacts', () => {
    it('Clear data base.', async () => {
      await testingRepository.deleteAll();
    });

    it('Add new users.', async () => {
      const response = await requests.userFactory().createAndLoginUsers(2);
      expect.setState({
        accessToken1: response[0].accessToken,
        accessToken2: response[1].accessToken,
      });
    });

    it(`Status ${HttpStatus.UNAUTHORIZED}.Trying get contacts without correct AccessToken .`, async () => {
      const response = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, 'notCorrectAccessToken');
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it(`Status ${HttpStatus.OK}.Get all contacts for users.`, async () => {
      const { accessToken1 } = expect.getState();
      const { accessToken2 } = expect.getState();
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken1);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(0);
      const response2 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken2);
      expect(response2.status).toBe(HttpStatus.OK);
      expect(response2.body.length).toBe(0);
    });

    it(`Status ${HttpStatus.CREATED}.Get all contacts for users after creating contact for user 1`, async () => {
      const { accessToken1 } = expect.getState();
      const { accessToken2 } = expect.getState();
      const response = await requests
        .contact()
        .createContact(preparedContactData.valid, accessToken1);
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(
        createContactsResponse(
          preparedContactData.valid.firstName,
          preparedContactData.valid.lastName,
          preparedContactData.valid.email,
          preparedContactData.valid.phoneNumber,
        ),
      );
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken1);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(1);
      const response2 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken2);
      expect(response2.status).toBe(HttpStatus.OK);
      expect(response2.body.length).toBe(0);
    });
  });
  describe('Update contacts', () => {
    it('Clear data base.', async () => {
      await testingRepository.deleteAll();
    });

    it('Add new users.', async () => {
      const response = await requests.userFactory().createAndLoginUsers(2);
      expect.setState({
        accessToken: response[0].accessToken,
        accessToken2: response[1].accessToken,
      });
    });

    it(`Status ${HttpStatus.CREATED}.Get all contacts for users.`, async () => {
      const { accessToken } = expect.getState();
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(0);
    });

    it(`Status ${HttpStatus.CREATED}.Create contact for user 1`, async () => {
      const { accessToken } = expect.getState();
      const response = await requests
        .contact()
        .createContact(preparedContactData.valid, accessToken);
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(
        createContactsResponse(
          preparedContactData.valid.firstName,
          preparedContactData.valid.lastName,
          preparedContactData.valid.email,
          preparedContactData.valid.phoneNumber,
        ),
      );
      expect.setState({
        contactId: response.body.id,
      });
    });

    it(`Status ${HttpStatus.NOT_FOUND}.Update contact with incorrect contactId`, async () => {
      const { accessToken } = expect.getState();
      const contactId = '1';
      const response = await requests
        .contact()
        .updateContact(preparedContactData.forUpdate, contactId, accessToken);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`Status ${HttpStatus.NO_CONTENT}.Correctly update contact`, async () => {
      const { accessToken } = expect.getState();
      const { contactId } = expect.getState();
      const response = await requests
        .contact()
        .updateContact(preparedContactData.forUpdate, contactId, accessToken);
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(1);
      expect(response1.body[0]).toStrictEqual(
        createContactsResponse(
          preparedContactData.forUpdate.firstName,
          preparedContactData.forUpdate.lastName,
          preparedContactData.forUpdate.email,
          preparedContactData.forUpdate.phoneNumber,
        ),
      );
    });

    it(`Status ${HttpStatus.UNAUTHORIZED}.Update contact which is not yours`, async () => {
      const { accessToken1 } = expect.getState();
      const { contactId } = expect.getState();
      const response = await requests
        .contact()
        .updateContact(preparedContactData.forUpdate, contactId, accessToken1);
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
  describe('Delete contacts', () => {
    it('Clear data base.', async () => {
      await testingRepository.deleteAll();
    });

    it('Add new users.', async () => {
      const response = await requests.userFactory().createAndLoginUsers(2);
      expect.setState({
        accessToken: response[0].accessToken,
        accessToken2: response[1].accessToken,
      });
    });

    it(`Status ${HttpStatus.CREATED}.Get all contacts for users.`, async () => {
      const { accessToken } = expect.getState();
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(0);
    });

    it(`Status ${HttpStatus.CREATED}.Create contact for user 1`, async () => {
      const { accessToken } = expect.getState();
      const response = await requests
        .contact()
        .createContact(preparedContactData.valid, accessToken);
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(
        createContactsResponse(
          preparedContactData.valid.firstName,
          preparedContactData.valid.lastName,
          preparedContactData.valid.email,
          preparedContactData.valid.phoneNumber,
        ),
      );
      expect.setState({
        contactId: response.body.id,
      });
    });

    it(`Status ${HttpStatus.NOT_FOUND}.Delete contact with incorrect contactId`, async () => {
      const { accessToken } = expect.getState();
      const contactId = '1';
      const response = await requests
        .contact()
        .deleteContact(contactId, accessToken);
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it(`Status ${HttpStatus.UNAUTHORIZED}.Delete contact which is not yours`, async () => {
      const { accessToken1 } = expect.getState();
      const { contactId } = expect.getState();
      const response = await requests
        .contact()
        .deleteContact(contactId, accessToken1);
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it(`Status ${HttpStatus.NO_CONTENT}.Correctly delete contact`, async () => {
      const { accessToken } = expect.getState();
      const { contactId } = expect.getState();
      const response = await requests
        .contact()
        .deleteContact(contactId, accessToken);
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(0);
    });
  });
  describe('Update contacts with super admin permission', () => {
    it('Clear data base.', async () => {
      await testingRepository.deleteAll();
    });

    it('Add new users.', async () => {
      const response = await requests.userFactory().createAndLoginUsers(2);
      expect.setState({
        accessToken1: response[0].accessToken,
        accessToken2: response[1].accessToken,
      });
    });

    it(`Status ${HttpStatus.CREATED}.Get all contacts for users.`, async () => {
      const { accessToken1 } = expect.getState();
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken1);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(0);
    });

    it(`Status ${HttpStatus.CREATED}.Create contact for user 1`, async () => {
      const { accessToken1 } = expect.getState();
      const response = await requests
        .contact()
        .createContact(preparedContactData.valid, accessToken1);
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(
        createContactsResponse(
          preparedContactData.valid.firstName,
          preparedContactData.valid.lastName,
          preparedContactData.valid.email,
          preparedContactData.valid.phoneNumber,
        ),
      );
      expect.setState({
        contactId: response.body.id,
      });
    });

    it(`Status ${HttpStatus.NO_CONTENT}.Give user 2 super admin permission`, async () => {
      const { accessToken2 } = expect.getState();
      const response = await requests
        .auth()
        .giveUserSuperAdminPermission(accessToken2);
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    it(`Status ${HttpStatus.NO_CONTENT}.Correctly update contact by user with sa`, async () => {
      const { accessToken2 } = expect.getState();
      const { contactId } = expect.getState();
      const response = await requests
        .contact()
        .updateContact(preparedContactData.forUpdate, contactId, accessToken2);
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken2);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(1);
      expect(response1.body[0]).toStrictEqual(
        createContactsResponse(
          preparedContactData.forUpdate.firstName,
          preparedContactData.forUpdate.lastName,
          preparedContactData.forUpdate.email,
          preparedContactData.forUpdate.phoneNumber,
        ),
      );
    });
  });
  describe('Delete contacts with super admin permission', () => {
    it('Clear data base.', async () => {
      await testingRepository.deleteAll();
    });

    it('Add new users.', async () => {
      const response = await requests.userFactory().createAndLoginUsers(2);
      expect.setState({
        accessToken1: response[0].accessToken,
        accessToken2: response[1].accessToken,
      });
    });

    it(`Status ${HttpStatus.CREATED}.Get all contacts for users.`, async () => {
      const { accessToken1 } = expect.getState();
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken1);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(0);
    });

    it(`Status ${HttpStatus.CREATED}.Create contact for user 1`, async () => {
      const { accessToken1 } = expect.getState();
      const response = await requests
        .contact()
        .createContact(preparedContactData.valid, accessToken1);
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(
        createContactsResponse(
          preparedContactData.valid.firstName,
          preparedContactData.valid.lastName,
          preparedContactData.valid.email,
          preparedContactData.valid.phoneNumber,
        ),
      );
      expect.setState({
        contactId: response.body.id,
      });
    });

    it(`Status ${HttpStatus.NO_CONTENT}.Give user 2 super admin permission`, async () => {
      const { accessToken2 } = expect.getState();
      const response = await requests
        .auth()
        .giveUserSuperAdminPermission(accessToken2);
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    it(`Status ${HttpStatus.NO_CONTENT}.Correctly delete contact by user with sa`, async () => {
      const { accessToken2 } = expect.getState();
      const { contactId } = expect.getState();
      const response = await requests
        .contact()
        .deleteContact(contactId, accessToken2);
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });
  });
  describe(`Upload and download contacts`, () => {
    it('Clear data base.', async () => {
      await testingRepository.deleteAll();
    });

    it('Add new users.', async () => {
      const response = await requests.userFactory().createAndLoginUsers(2);
      expect.setState({
        accessToken1: response[0].accessToken,
        accessToken2: response[1].accessToken,
      });
    });

    it(`Status ${HttpStatus.CREATED}.Get all contacts for user 1.`, async () => {
      const { accessToken1 } = expect.getState();
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken1);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(0);
    });

    it(`Status ${HttpStatus.NO_CONTENT}.Upload contacts from csv file by user `, async () => {
      const { accessToken1 } = expect.getState();
      const file: any = await readFileAsync(join('csv-for-test', 'myFile.csv'));
      const response = await requests
        .contact()
        .uploadCsvFile(file, accessToken1);
      expect(response.status).toBe(HttpStatus.NO_CONTENT);
    });

    it(`Status ${HttpStatus.CREATED}.Get all contacts for user 1.`, async () => {
      const { accessToken1 } = expect.getState();
      const response1 = await requests
        .contact()
        .getAllContacts(preparedGetAllContactsData, accessToken1);
      expect(response1.status).toBe(HttpStatus.OK);
      expect(response1.body.length).toBe(5);
    });

    it(`Status ${HttpStatus.CREATED}.Create contact for user 1`, async () => {
      const { accessToken2 } = expect.getState();
      const response = await requests
        .contact()
        .createContact(preparedContactData.valid, accessToken2);
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(
        createContactsResponse(
          preparedContactData.valid.firstName,
          preparedContactData.valid.lastName,
          preparedContactData.valid.email,
          preparedContactData.valid.phoneNumber,
        ),
      );
    });
    it(`Status ${HttpStatus.OK}.Create contact for user 1`, async () => {
      const { accessToken2 } = expect.getState();
      const response = await requests.contact().downloadCsvFile(accessToken2);
      expect(response.status).toBe(HttpStatus.OK);
    });
  });
});
