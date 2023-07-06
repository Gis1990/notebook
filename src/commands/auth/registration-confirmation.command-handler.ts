import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../repositories/user-query.repository';
import { UserRepository } from '../../repositories/user.repository';

export class RegistrationConfirmationCommand {
  constructor(public readonly confirmationCode: string) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationCommandHandler
  implements ICommandHandler<RegistrationConfirmationCommand, boolean>
{
  constructor(
    private userRepository: UserRepository,
    private userQueryRepository: UserQueryRepository,
  ) {}

  async execute(command: RegistrationConfirmationCommand): Promise<boolean> {
    const user = await this.userQueryRepository.getUserByConfirmationCode(
      command.confirmationCode,
    );
    await this.userRepository.updateUserConfirmationStatus(user.id);
    return true;
  }
}
