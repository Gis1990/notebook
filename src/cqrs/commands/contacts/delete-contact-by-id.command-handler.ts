import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ContactRepository } from '../../../repositories/contact.repository';
import { ContactQueryRepository } from '../../../repositories/contact-query.repository';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

export class DeleteContactCommand {
  constructor(
    public readonly userId: string,
    public readonly contactId: string,
  ) {}
}

@CommandHandler(DeleteContactCommand)
export class DeleteContactCommandHandler
  implements ICommandHandler<DeleteContactCommand, boolean>
{
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly contactQueryRepository: ContactQueryRepository,
  ) {}

  async execute(command: DeleteContactCommand): Promise<boolean> {
    const contact = await this.contactQueryRepository.getContactById(
      command.contactId,
    );
    if (!contact) {
      throw new BadRequestException('Contact not found');
    }
    if (contact.userId !== command.userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this contact',
      );
    }
    return await this.contactRepository.deleteContact(command.contactId);
  }
}
