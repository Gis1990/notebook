import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../../repositories/user-query.repository';
import { User } from '@prisma/client';

export class GetUserByIdCommand {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetUserByIdCommand)
export class GetUserByIdQuery implements IQueryHandler<GetUserByIdCommand> {
  constructor(private userQueryRepository: UserQueryRepository) {}

  async execute(query: GetUserByIdCommand): Promise<User | null> {
    return await this.userQueryRepository.getUserById(query.userId);
  }
}
