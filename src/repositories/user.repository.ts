import { Injectable } from '@nestjs/common';
import { User, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailConfirmation } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(
    user: Prisma.UserCreateInput,
    emailConfirmation: EmailConfirmation,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
        EmailConfirmation: {
          create: {
            confirmationCode: emailConfirmation.confirmationCode,
          },
        },
      },
    });
  }

  async updateUserConfirmationStatus(userId: string): Promise<boolean> {
    const result = await this.prisma.user.update({
      where: { id: userId },
      data: { isUserConfirmed: true },
    });

    return typeof result !== null;
  }

  async updateLoginCode(
    userId: string,
    codeForLogin: string,
  ): Promise<boolean> {
    const result = await this.prisma.emailConfirmation.update({
      where: { userId },
      data: { codeForLogin },
    });

    return typeof result !== null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.prisma.user.delete({ where: { id } });
    return typeof result !== null;
  }
}
