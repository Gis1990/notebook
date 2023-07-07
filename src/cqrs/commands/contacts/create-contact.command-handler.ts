import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateContactDto } from '../../../modules/contacts/dto/create-contact.dto';
import { ContactRepository } from '../../../repositories/contact.repository';
import { Contact } from '@prisma/client';

export class CreateContactCommand {
  constructor(
    public readonly dto: CreateContactDto,
    public readonly userId: string,
  ) {}
}

@CommandHandler(CreateContactCommand)
export class CreateContactCommandHandler
  implements ICommandHandler<CreateContactCommand>
{
  constructor(private readonly contactRepository: ContactRepository) {}

  async execute(command: CreateContactCommand): Promise<Contact> {
    return await this.contactRepository.createContact(
      command.dto,
      command.userId,
    );
  }
}
