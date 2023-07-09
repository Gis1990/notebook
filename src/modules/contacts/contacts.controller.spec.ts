import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  preparedContactData,
  preparedContactId,
  preparedGetAllContactsData,
  preparedUserId,
} from '../../../test/prepared-data/prepared-contact.data';
import { GetAllContactsCommand } from '../../cqrs/queries/contacts/get-all-contacts-query';
import { createContactsResponse } from '../../../test/response/contacts/create-contact.response';
import { CreateContactCommand } from '../../cqrs/commands/contacts/create-contact.command-handler';
import { DeleteContactCommand } from '../../cqrs/commands/contacts/delete-contact-by-id.command-handler';
import { JwtService } from '@nestjs/jwt';
import { UserQueryRepository } from '../../repositories/user-query.repository';
import { UserRepository } from '../../repositories/user.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import { UpdateContactCommand } from '../../cqrs/commands/contacts/update-contact-by-id.command-handler';

describe('ContactsController', () => {
  let controller: ContactsController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        CommandBus,
        QueryBus,
        JwtService,
        UserQueryRepository,
        UserRepository,
        PrismaService,
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  describe('getAllContacts', () => {
    it('should return an array of contacts', async () => {
      const getAllContactsCommand = new GetAllContactsCommand(
        preparedGetAllContactsData,
        preparedUserId.userId,
      );

      const expectedContacts = [];
      jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(expectedContacts);

      const result = await controller.getAllContacts(
        preparedGetAllContactsData,
        preparedUserId.userId,
      );
      expect(queryBus.execute).toHaveBeenCalledWith(getAllContactsCommand);
      expect(result).toEqual(expectedContacts);
    });
  });

  describe('createContact', () => {
    it('should create a contact and return it', async () => {
      const createContactCommand = new CreateContactCommand(
        preparedContactData.valid,
        preparedUserId.userId,
      );

      const expectedContact = createContactsResponse(
        preparedContactData.valid.firstName,
        preparedContactData.valid.lastName,
        preparedContactData.valid.email,
        preparedContactData.valid.phoneNumber,
      );
      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(expectedContact);

      const result = await controller.createContact(
        preparedContactData.valid,
        preparedUserId.userId,
      );

      expect(commandBus.execute).toHaveBeenCalledWith(createContactCommand);
      expect(result).toEqual(expectedContact);
    });
  });

  describe('updateContact', () => {
    it('should delete a contact and return true', async () => {
      const updateContactCommand = new UpdateContactCommand(
        preparedContactData.forUpdate,
        preparedUserId.userId,
        preparedContactId.id,
      );
      const expectedResultUpdate = createContactsResponse(
        preparedContactData.forUpdate.firstName,
        preparedContactData.valid.lastName,
        preparedContactData.valid.email,
        preparedContactData.valid.phoneNumber,
      );

      jest
        .spyOn(commandBus, 'execute')
        .mockResolvedValueOnce(expectedResultUpdate);

      const result = await controller.updateContact(
        preparedContactData.forUpdate,
        preparedUserId.userId,
        preparedContactId,
      );
      expect(commandBus.execute).toHaveBeenCalledWith(updateContactCommand);
      expect(result).toBe(expectedResultUpdate);
    });
  });

  describe('deleteContact', () => {
    it('should delete a contact and return true', async () => {
      const deleteContactCommand = new DeleteContactCommand(
        preparedUserId.userId,
        preparedContactId.id,
      );

      jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(true);

      const result = await controller.deleteContact(
        preparedUserId.userId,
        preparedContactId,
      );
      expect(commandBus.execute).toHaveBeenCalledWith(deleteContactCommand);
      expect(result).toBe(true);
    });
  });
});
