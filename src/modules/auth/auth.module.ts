import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { IsConfirmationCodeExistConstraint } from './decorators/confirmation-code.decorator';
import {
  IsEmailExistConstraint,
  IsEmailExistForRegistrationConstraint,
} from './decorators/email.decorator';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserQueryRepository } from '../../repositories/user-query.repository';
import { UserRepository } from '../../repositories/user.repository';
import { CreateUserCommandHandler } from '../../cqrs/commands/auth/create-user.command-handler';
import { GetUserByIdQuery } from '../../cqrs/queries/auth/get-user-by-id-query';
import { GetUserByEmailQuery } from '../../cqrs/queries/auth/get-user-by-email-query';
import { RegistrationConfirmationCommandHandler } from '../../cqrs/commands/auth/registration-confirmation.command-handler';
import { IsCodeForLoginExistConstraint } from './decorators/login-code.decorator';
import { GetUserByConfirmationCodeQuery } from '../../cqrs/queries/auth/get-user-by-confirmation-code-query';
import { GetUserByCodeForLoginQuery } from '../../cqrs/queries/auth/get-user-by-code-for-login.query';
import { LoginUserByCodeCommandHandler } from '../../cqrs/commands/auth/login-user-by-code.command-handler';
import { LoginUserCommandHandler } from '../../cqrs/commands/auth/login-user.command-handler';
import { EmailAdapters, EmailManager } from '../../adapters/email.adapter';
import { TokensFactory } from '../../factories/tokens.factory';
import { IsUserIdExistConstraint } from './decorators/user-id.decorator';
import { GiveUserSuperAdminPermissionCommandHandler } from '../../cqrs/commands/auth/give-user-sa-permission.command-handler';

export const AuthCommandHandlers = [
  CreateUserCommandHandler,
  RegistrationConfirmationCommandHandler,
  LoginUserByCodeCommandHandler,
  LoginUserCommandHandler,
  GiveUserSuperAdminPermissionCommandHandler,
];
export const AuthQueryHandlers = [
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
    IsUserIdExistConstraint,
    PrismaService,
    EmailAdapters,
    EmailManager,
    TokensFactory,
    UserQueryRepository,
    UserRepository,
    ...AuthCommandHandlers,
    ...AuthQueryHandlers,
  ],
  exports: [AuthModule],
})
export class AuthModule {}
