import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../../repositories/user-query.repository';
import { UserRepository } from '../../../repositories/user.repository';
import { BadRequestException } from '@nestjs/common';

export class GiveUserSuperAdminPermissionCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(GiveUserSuperAdminPermissionCommand)
export class GiveUserSuperAdminPermissionCommandHandler
  implements ICommandHandler<GiveUserSuperAdminPermissionCommand>
{
  constructor(
    private userQueryRepository: UserQueryRepository,
    private userRepository: UserRepository,
  ) {}

  async execute(
    command: GiveUserSuperAdminPermissionCommand,
  ): Promise<boolean> {
    const user = await this.userQueryRepository.getUserById(command.userId);
    if (!user) {
      throw new BadRequestException();
    }
    if (user.isUserSuperAdmin) {
      throw new BadRequestException();
    }
    return await this.userRepository.updateSaPermission(user.id);
  }
}
