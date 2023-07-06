import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../repositories/user-query.repository';
import { UserRepository } from '../../repositories/user.repository';
import { UnauthorizedException } from '@nestjs/common';
import { PairTokenResponse } from '../../dto/auth/response-dto/pair-token.response';
import { TokensFactory } from '../../factories/tokens.factory';
import { LoginConfirmationDto } from '../../dto/auth/login.confirmation.dto';

export class LoginUserByCodeCommand {
  constructor(public readonly dto: LoginConfirmationDto) {}
}

@CommandHandler(LoginUserByCodeCommand)
export class LoginUserByCodeCommandHandler
  implements ICommandHandler<LoginUserByCodeCommand, PairTokenResponse>
{
  constructor(
    private userQueryRepository: UserQueryRepository,
    private userRepository: UserRepository,
    private factory: TokensFactory,
  ) {}

  async execute(command: LoginUserByCodeCommand): Promise<PairTokenResponse> {
    const user = await this.userQueryRepository.getUserByEmail(
      command.dto.email,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.isUserConfirmed) {
      throw new UnauthorizedException();
    }
    await this.userRepository.updateLoginCode(
      user.id,
      Date.now().toString() + 'Invalid',
    );
    return await this.factory.getPairTokens(user.id);
  }
}
