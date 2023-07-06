import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiLogin,
  ApiLoginConfirmation,
  ApiRegistration,
  ApiRegistrationConfirmation,
} from '../../../documentation/swagger/auth.documentation';
import { RegistrationDto } from '../../dto/auth/registration.dto';
import { RegistrationConfirmationDto } from '../../dto/auth/registration-confirmation.dto';
import { LoginDto } from '../../dto/auth/login.dto';
import { ViewUser } from '../../entities/user-view.schema';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../commands/auth/create-user.command-handler';
import { RegistrationConfirmationCommand } from '../../commands/auth/registration-confirmation.command-handler';
import { LoginUserCommand } from '../../commands/auth/login-user.command-handler';
import { LoginConfirmationDto } from '../../dto/auth/login.confirmation.dto';
import { TokenResponse } from '../../dto/auth/response-dto/tokenResponse';
import { Response } from 'express';
import { LoginUserByCodeCommand } from '../../commands/auth/login-user-by-code.command-handler';
import { settings } from '../../../config/settings';

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
}
