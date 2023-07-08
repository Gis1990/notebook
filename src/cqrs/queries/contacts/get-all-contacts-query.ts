import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Contact } from '@prisma/client';
import { GetAllContactsDto } from '../../../modules/contacts/dto/get-all-contacts.dto';
import { ContactQueryRepository } from '../../../repositories/contact-query.repository';
import { UserQueryRepository } from '../../../repositories/user-query.repository';

export class GetAllContactsCommand {
  constructor(
    public readonly dto: GetAllContactsDto,
    public readonly userId: string,
  ) {}
}

@QueryHandler(GetAllContactsCommand)
export class GetAllContactsQuery
  implements IQueryHandler<GetAllContactsCommand>
{
  constructor(
    private contactQueryRepository: ContactQueryRepository,
    private userQueryRepository: UserQueryRepository,
  ) {}

  async execute(query: GetAllContactsCommand): Promise<Contact[]> {
    const user = await this.userQueryRepository.getUserById(query.userId);
    if (user?.isUserSuperAdmin) {
      return await this.contactQueryRepository.getAllContactsForSuperAdmin(
        query.dto,
      );
    }
    return await this.contactQueryRepository.getAllContacts(
      query.userId,
      query.dto,
    );
  }
}
