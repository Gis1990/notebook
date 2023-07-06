import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../repositories/user-query.repository';
import { User } from '@prisma/client';

export class GetUserByConfirmationCodeCommand {
  constructor(public readonly code: string) {}
}

@QueryHandler(GetUserByConfirmationCodeCommand)
export class GetUserByConfirmationCodeQuery
  implements IQueryHandler<GetUserByConfirmationCodeCommand>
{
  constructor(private userQueryRepository: UserQueryRepository) {}

  async execute(query: GetUserByConfirmationCodeCommand): Promise<User | null> {
    return await this.userQueryRepository.getUserByConfirmationCode(query.code);
  }
}
