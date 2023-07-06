import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdateUserInfoCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(UpdateUserInfoCommand)
export class UpdateContactCommandHandler
  implements ICommandHandler<UpdateUserInfoCommand>
{
  constructor() {}

  async execute(command: UpdateUserInfoCommand) {}
}
