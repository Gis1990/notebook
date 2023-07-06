import bcrypt from 'bcrypt';
import { RegistrationDto } from '../dto/auth/registration.dto';

export class NewUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string = new Date().toISOString();

  static async create(user: RegistrationDto) {
    const _user = new NewUser();
    Object.assign(_user, user);
    _user.passwordHash = await bcrypt.hash(user.password, 10);
    return _user;
  }
}
