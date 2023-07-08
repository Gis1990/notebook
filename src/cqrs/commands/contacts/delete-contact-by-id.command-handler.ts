import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ContactRepository } from '../../../repositories/contact.repository';
import { ContactQueryRepository } from '../../../repositories/contact-query.repository';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserQueryRepository } from '../../../repositories/user-query.repository';

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
    private userQueryRepository: UserQueryRepository,
  ) {}

  async execute(command: DeleteContactCommand): Promise<boolean> {
    const user = await this.userQueryRepository.getUserById(command.userId);
    const contact = await this.contactQueryRepository.getContactById(
      command.contactId,
    );
    if (!contact) {
      throw new BadRequestException('Contact not found');
    }
    if (user?.isUserSuperAdmin) {
      return await this.contactRepository.deleteContact(command.contactId);
    }
    if (contact.userId !== command.userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this contact',
      );
    }
    return await this.contactRepository.deleteContact(command.contactId);
  }
}
