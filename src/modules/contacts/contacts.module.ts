import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ContactsController } from './contacts.controller';
import { IsContactIdExistConstraint } from './decorators/contact-id.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { ContactRepository } from '../../repositories/contact.repository';
import { ContactQueryRepository } from '../../repositories/contact-query.repository';
import { CreateContactCommandHandler } from '../../cqrs/commands/contacts/create-contact.command-handler';
import { UpdateContactCommandHandler } from '../../cqrs/commands/contacts/update-contact-by-id.command-handler';
import { DeleteContactCommandHandler } from '../../cqrs/commands/contacts/delete-contact-by-id.command-handler';
import { GetContactByIdQuery } from '../../cqrs/queries/contacts/get-contact-by-id.query';
import { GetAllContactsQuery } from '../../cqrs/queries/contacts/get-all-contacts-query';
import { JwtModule } from '@nestjs/jwt';
import { UserQueryRepository } from '../../repositories/user-query.repository';
import { SaveContactsFromScvCommandHandler } from '../../cqrs/commands/contacts/save-contacts-from-scv-file.command-handler';
import { ConvertContactsToCsvCommandHandler } from '../../cqrs/commands/contacts/convert-contacts-to-scv.command-handler';
import { S3StorageAdapter } from '../../adapters/file-storage.adapter/file.storage.adapter';

const commandHandlers = [
  CreateContactCommandHandler,
  UpdateContactCommandHandler,
  DeleteContactCommandHandler,
  SaveContactsFromScvCommandHandler,
  ConvertContactsToCsvCommandHandler,
];
const queryHandlers = [GetContactByIdQuery, GetAllContactsQuery];

@Module({
  imports: [CqrsModule, JwtModule.register({})],
  controllers: [ContactsController],
  providers: [
    IsContactIdExistConstraint,
    PrismaService,
    ContactRepository,
    ContactQueryRepository,
    UserQueryRepository,
    S3StorageAdapter,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [],
})
export class ContactsModule {}
