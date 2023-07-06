import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { IsConfirmationCodeExistConstraint } from '../../decorators/confirmation-code.decorator';
import {
  IsEmailExistConstraint,
  IsEmailExistForRegistrationConstraint,
} from '../../decorators/email.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserQueryRepository } from '../../repositories/user-query.repository';
import { UserRepository } from '../../repositories/user.repository';
import { CreateUserCommandHandler } from '../../commands/auth/create-user.command-handler';
import { GetUserByIdQuery } from '../../queries/get-user-by-id-query';
import { GetUserByEmailQuery } from '../../queries/get-user-by-email-query';
import { RegistrationConfirmationCommandHandler } from '../../commands/auth/registration-confirmation.command-handler';
import { IsCodeForLoginExistConstraint } from '../../decorators/login-code.decorator';
import { GetUserByConfirmationCodeQuery } from '../../queries/get-user-by-confirmation-code-query';
import { GetUserByCodeForLoginQuery } from '../../queries/get-user-by-code-for-login.query';
import { LoginUserByCodeCommandHandler } from '../../commands/auth/login-user-by-code.command-handler';
import { LoginUserCommandHandler } from '../../commands/auth/login-user.command-handler';
import { EmailAdapters, EmailManager } from '../../adapters/email.adapter';
import { TokensFactory } from '../../factories/tokens.factory';

const commandHandlers = [
  CreateUserCommandHandler,
  RegistrationConfirmationCommandHandler,
  LoginUserByCodeCommandHandler,
  LoginUserCommandHandler,
];
const queryHandlers = [
  GetUserByIdQuery,
  GetUserByEmailQuery,
  GetUserByConfirmationCodeQuery,
  GetUserByCodeForLoginQuery,
];

@Module({
  imports: [CqrsModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    IsConfirmationCodeExistConstraint,
    IsEmailExistConstraint,
    IsEmailExistForRegistrationConstraint,
    IsCodeForLoginExistConstraint,
    PrismaService,
    EmailAdapters,
    EmailManager,
    TokensFactory,
    UserQueryRepository,
    UserRepository,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [],
})
export class AuthModule {}
