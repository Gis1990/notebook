import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiGiveUserSuperAdminPermission,
  ApiLogin,
  ApiLoginConfirmation,
  ApiRegistration,
  ApiRegistrationConfirmation,
} from '../../../documentation/swagger/auth.documentation';
import { ViewUser } from './entities/user-view.schema';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../cqrs/commands/auth/create-user.command-handler';
import { RegistrationConfirmationCommand } from '../../cqrs/commands/auth/registration-confirmation.command-handler';
import { LoginUserCommand } from '../../cqrs/commands/auth/login-user.command-handler';
import { Response } from 'express';
import { LoginUserByCodeCommand } from '../../cqrs/commands/auth/login-user-by-code.command-handler';
import { settings } from '../../../config/settings';
import { GiveUserSuperAdminPermissionCommand } from '../../cqrs/commands/auth/give-user-sa-permission.command-handler';
import { RegistrationDto } from './dto/registration.dto';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { LoginDto } from './dto/login.dto';
import { LoginConfirmationDto } from './dto/login.confirmation.dto';
import { TokenResponse } from './dto/response-dto/tokenResponse';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthBearerGuard } from '../../guards/auth-bearer.guard';

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @Post('registration')
  @ApiRegistration()
  async registration(@Body() dto: RegistrationDto): Promise<ViewUser> {
    return await this.commandBus.execute(new CreateUserCommand(dto));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiRegistrationConfirmation()
  async registrationConfirmation(
    @Query() dto: RegistrationConfirmationDto,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new RegistrationConfirmationCommand(dto.confirmationCode),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiLogin()
  async login(@Body() dto: LoginDto): Promise<boolean> {
    return await this.commandBus.execute(new LoginUserCommand(dto));
  }

  @Post('login-confirmation-code')
  @HttpCode(HttpStatus.OK)
  @ApiLoginConfirmation()
  async loginConfirmation(
    @Body() dto: LoginConfirmationDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<TokenResponse> {
    const tokens = await this.commandBus.execute(
      new LoginUserByCodeCommand(dto),
    );
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: settings.timeLife.TOKEN_TIME,
    });
    return { accessToken: tokens.accessToken };
  }

  @Post('super-admin-permission')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthBearerGuard)
  @ApiGiveUserSuperAdminPermission()
  async giveUserSuperAdminPermission(
    @CurrentUser() userId: string,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new GiveUserSuperAdminPermissionCommand(userId),
    );
  }
}
