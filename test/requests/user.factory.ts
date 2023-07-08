import { AuthRequest } from './auth.request';
import { preparedRegistrationData } from '../prepared-data/prepared-user.data';
import { Testing } from './testing.request';
import { ViewUser } from '../../src/modules/auth/entities/user-view.schema';
import { RegistrationDto } from '../../src/modules/auth/dto/registration.dto';
import { LoginDto } from '../../src/modules/auth/dto/login.dto';
import { UserWithTokensType } from '../types/user-with-tokens.type';

export class UserFactory {
  constructor(
    private readonly server: any,
    private readonly authRequest: AuthRequest,
    private readonly testingRequest: Testing,
  ) {}

  async createUsers(usersCount: number, startWith = 0): Promise<ViewUser[]> {
    const result = [];
    for (let i = 0; i < usersCount; i++) {
      const inputData: RegistrationDto = {
        email: `somemail${i + startWith}@gmail.com`,
        password: 'qwerty123',
      };

      const response = await this.authRequest.registrationUser(inputData);

      result.push(response.body);
    }

    return result;
  }

  async createAndLoginUsers(
    userCount: number,
    startWith = 0,
  ): Promise<UserWithTokensType[]> {
    const users = await this.createUsers(userCount, startWith);

    const result = [];
    for (let i = 0; i < userCount; i++) {
      const createdUser = await this.testingRequest.getUser(users[i].id);

      await this.authRequest.confirmRegistration(
        createdUser.EmailConfirmation.confirmationCode,
      );

      const userLoginData: LoginDto = {
        email: createdUser.email,
        password: preparedRegistrationData.valid.password,
      };

      const response = await this.authRequest.loginUser(userLoginData);

      result.push({
        user: users[i],
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    }

    return result;
  }
}
