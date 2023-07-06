import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../repositories/user-query.repository';
import { User } from '@prisma/client';

export class GetUserByCodeForLoginCommand {
  constructor(public readonly code: string) {}
}

@QueryHandler(GetUserByCodeForLoginCommand)
export class GetUserByCodeForLoginQuery
  implements IQueryHandler<GetUserByCodeForLoginCommand>
{
  constructor(private userQueryRepository: UserQueryRepository) {}

  async execute(query: GetUserByCodeForLoginCommand): Promise<User | null> {
    return await this.userQueryRepository.getUserByCodeForLogin(query.code);
  }
}
