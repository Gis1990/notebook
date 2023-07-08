import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateContactDto } from '../../../modules/contacts/dto/update-contact.dto';
import { ContactRepository } from '../../../repositories/contact.repository';
import { ContactQueryRepository } from '../../../repositories/contact-query.repository';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserQueryRepository } from '../../../repositories/user-query.repository';

export class UpdateContactCommand {
  constructor(
    public readonly dto: UpdateContactDto,
    public readonly userId: string,
    public readonly contactId: string,
  ) {}
}

@CommandHandler(UpdateContactCommand)
export class UpdateContactCommandHandler
  implements ICommandHandler<UpdateContactCommand>
{
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly contactQueryRepository: ContactQueryRepository,
    private userQueryRepository: UserQueryRepository,
  ) {}

  async execute(command: UpdateContactCommand): Promise<boolean> {
    const user = await this.userQueryRepository.getUserById(command.userId);
    const contact = await this.contactQueryRepository.getContactById(
      command.contactId,
    );
    if (user?.isUserSuperAdmin) {
      return await this.contactRepository.updateContact(
        command.dto,
        command.contactId,
      );
    }
    if (!contact) {
      throw new BadRequestException('Contact not found');
    }
    if (contact.userId !== command.userId) {
      throw new ForbiddenException(
        'You are not allowed to update this contact',
      );
    }
    return await this.contactRepository.updateContact(
      command.dto,
      command.contactId,
    );
  }
}
