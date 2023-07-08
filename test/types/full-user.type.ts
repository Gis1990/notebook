import { User } from '@prisma/client';

export class TFullUser implements User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  isUserConfirmed: boolean;
  isUserSuperAdmin: boolean;
  EmailConfirmation: {
    confirmationCode: string;
    codeForLogin: string;
  };
}
