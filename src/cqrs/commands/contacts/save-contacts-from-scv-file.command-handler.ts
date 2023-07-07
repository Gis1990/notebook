import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ContactRepository } from '../../../repositories/contact.repository';
import { Prisma } from '@prisma/client';
import { CreateContactDto } from '../../../modules/contacts/dto/create-contact.dto';

export class SaveContactsFromScvCommand {
  constructor(
    public readonly dto: CreateContactDto[],
    public readonly userId: string,
  ) {}
}

@CommandHandler(SaveContactsFromScvCommand)
export class SaveContactsFromScvCommandHandler
  implements ICommandHandler<SaveContactsFromScvCommand>
{
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(
    command: SaveContactsFromScvCommand,
  ): Promise<Prisma.BatchPayload> {
    const validDtos = command.dto.filter(
      (dto) => dto.firstName && dto.lastName && dto.email && dto.phoneNumber,
    );
    return await this.contactRepository.saveContactsFromCsv(
      validDtos,
      command.userId,
    );
  }
}
