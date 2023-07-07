import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Contact } from '@prisma/client';
import { ContactQueryRepository } from '../../../repositories/contact-query.repository';

export class GetContactByIdCommand {
  constructor(public readonly contactId: string) {}
}

@QueryHandler(GetContactByIdCommand)
export class GetContactByIdQuery
  implements IQueryHandler<GetContactByIdCommand>
{
  constructor(private contactQueryRepository: ContactQueryRepository) {}

  async execute(query: GetContactByIdCommand): Promise<Contact | null> {
    return await this.contactQueryRepository.getContactById(query.contactId);
  }
}
