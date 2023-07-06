import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserQueryRepository } from '../../repositories/user-query.repository';
import bcrypt from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../../dto/auth/login.dto';
import { EmailManager } from '../../adapters/email.adapter';
import { UserRepository } from '../../repositories/user.repository';

export class LoginUserCommand {
  constructor(public readonly dto: LoginDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserCommandHandler
  implements ICommandHandler<LoginUserCommand>
{
  constructor(
    private userQueryRepository: UserQueryRepository,
    private readonly emailManager: EmailManager,
    private userRepository: UserRepository,
  ) {}

  async execute(command: LoginUserCommand): Promise<boolean> {
    const user = await this.userQueryRepository.getUserByEmail(
      command.dto.email,
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.isUserConfirmed) {
      throw new UnauthorizedException();
    }
    const passwordEqual = await bcrypt.compare(
      command.dto.password,
      user.passwordHash,
    );
    if (!passwordEqual) {
      throw new UnauthorizedException();
    }
    const loginCode = Date.now().toString();
    try {
      await this.emailManager.sendLoginCodeByEmail(user.email, loginCode);
      await this.userRepository.updateLoginCode(user.id, loginCode);
    } catch (e) {
      throw new BadRequestException('Error while sending email');
    }
    return true;
  }
}
