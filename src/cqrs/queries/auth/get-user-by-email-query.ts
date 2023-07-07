import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../../repositories/user-query.repository';
import { User } from '@prisma/client';

export class GetUserByEmailCommand {
  constructor(public readonly email: string) {}
}

@QueryHandler(GetUserByEmailCommand)
export class GetUserByEmailQuery
  implements IQueryHandler<GetUserByEmailCommand>
{
  constructor(private userQueryRepository: UserQueryRepository) {}

  async execute(query: GetUserByEmailCommand): Promise<User | null> {
    return await this.userQueryRepository.getUserByEmail(query.email);
  }
}
