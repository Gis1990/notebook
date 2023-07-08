import { Test } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../cqrs/commands/auth/create-user.command-handler';
import { ViewUser } from './entities/user-view.schema';
import { AuthController } from './auth.controller';
import { preparedRegistrationData } from '../../../test/prepared-data/prepared-user.data';
import { createUserResponse } from '../../../test/response/auth/create-user.response';
import { RegistrationConfirmationCommand } from '../../cqrs/commands/auth/registration-confirmation.command-handler';
import { LoginDto } from './dto/login.dto';
import { LoginUserCommand } from '../../cqrs/commands/auth/login-user.command-handler';
import { LoginConfirmationDto } from './dto/login.confirmation.dto';
import { LoginUserByCodeCommand } from '../../cqrs/commands/auth/login-user-by-code.command-handler';
import { settings } from '../../../config/settings';
import { SaPermissionDto } from './dto/sa-permission.dto';
import { GiveUserSuperAdminPermissionCommand } from '../../cqrs/commands/auth/give-user-sa-permission.command-handler';

describe('RegistrationController', () => {
  let authController: AuthController;
  let commandBus: CommandBus;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [CommandBus],
    }).compile();

    authController = moduleRef.get<AuthController>(AuthController);
    commandBus = moduleRef.get<CommandBus>(CommandBus);
  });

  describe('registration', () => {
    it('should create a new user', async () => {
      const createUserCommand = new CreateUserCommand(
        preparedRegistrationData.valid,
      );
      const expectedUser: ViewUser = createUserResponse(
        preparedRegistrationData.valid.email,
      );
      jest.spyOn(commandBus, 'execute').mockResolvedValue(expectedUser);
      const result = await authController.registration(
        preparedRegistrationData.valid,
      );

      expect(commandBus.execute).toHaveBeenCalledWith(createUserCommand);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('registrationConfirmation', () => {
    it('should execute registration confirmation command', async () => {
      const confirmationCode = 'ABC123';
      const registrationConfirmationCommand =
        new RegistrationConfirmationCommand(confirmationCode);

      jest.spyOn(commandBus, 'execute').mockResolvedValue(true);

      const result = await authController.registrationConfirmation({
        confirmationCode,
      });

      expect(commandBus.execute).toHaveBeenCalledWith(
        registrationConfirmationCommand,
      );
      expect(result).toBe(true);
    });
  });

  describe('login', () => {
    it('should execute login user command', async () => {
      const loginDto: LoginDto = preparedRegistrationData.valid;
      const loginUserCommand = new LoginUserCommand(loginDto);
      jest.spyOn(commandBus, 'execute').mockResolvedValue(true);
      const result = await authController.login(loginDto);
      expect(commandBus.execute).toHaveBeenCalledWith(loginUserCommand);
      expect(result).toBe(true);
    });
  });

  describe('loginConfirmation', () => {
    it('should execute login user by code command and set refresh token cookie', async () => {
      const loginConfirmationDto: LoginConfirmationDto = {
        email: preparedRegistrationData.valid.email,
        codeForLogin: '123',
      };
      const loginByCodeCommand = new LoginUserByCodeCommand(
        loginConfirmationDto,
      );
      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };
      const responseMock = {
        cookie: jest.fn(),
      };

      jest.spyOn(commandBus, 'execute').mockResolvedValue(tokens);

      const result = await authController.loginConfirmation(
        loginConfirmationDto,
        responseMock as any,
      );

      expect(commandBus.execute).toHaveBeenCalledWith(loginByCodeCommand);
      expect(responseMock.cookie).toHaveBeenCalledWith(
        'refreshToken',
        tokens.refreshToken,
        {
          httpOnly: true,
          secure: true,
          maxAge: settings.timeLife.TOKEN_TIME,
        },
      );
      expect(result).toEqual({ accessToken: tokens.accessToken });
    });
  });

  describe('giveUserSuperAdminPermission', () => {
    it('should execute give user super admin permission command', async () => {
      const saPermissionDto: SaPermissionDto = {
        userId: '123',
      };
      const giveUserSuperAdminPermissionCommand =
        new GiveUserSuperAdminPermissionCommand(saPermissionDto);
      jest.spyOn(commandBus, 'execute').mockResolvedValue(true);

      const result = await authController.giveUserSuperAdminPermission(
        saPermissionDto,
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        giveUserSuperAdminPermissionCommand,
      );
      expect(result).toBe(true);
    });
  });
});
