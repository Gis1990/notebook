import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../../repositories/user.repository';
import { UserQueryRepository } from '../../repositories/user-query.repository';
import { RegistrationDto } from '../../dto/auth/registration.dto';
import { EmailConfirmation } from '../../entities/email-confirmation.schema';
import { ViewUser } from '../../entities/user-view.schema';
import { NewUser } from '../../entities/new-user.schema';
import { EmailManager } from '../../adapters/email.adapter';
import { BadRequestException } from '@nestjs/common';

export class CreateUserCommand {
  constructor(public readonly dto: RegistrationDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand, ViewUser>
{
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userQueryRepository: UserQueryRepository,
    private readonly emailManager: EmailManager,
  ) {}

  async execute(command: CreateUserCommand): Promise<ViewUser> {
    const user = await this.userQueryRepository.getUserByEmail(
      command.dto.email,
    );
    if (user) {
      throw new BadRequestException('Email already exists');
    }
    const newUser = await NewUser.create(command.dto);
    const emailConfirmation = await EmailConfirmation.create();
    let createdUser;
    try {
      createdUser = await this.userRepository.createUser(
        newUser,
        emailConfirmation,
      );
      await this.emailManager.sendConfirmationEmail(
        createdUser.email,
        emailConfirmation.confirmationCode,
      );
    } catch (e) {
      throw new BadRequestException('Error while sending email');
    }
    return await ViewUser.create(createdUser);
  }
}
