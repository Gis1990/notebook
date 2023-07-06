import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UserQueryRepository {
  constructor(private prisma: PrismaService) {}

  async getUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id: userId },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: email },
    });
  }

  async getUserByConfirmationCode(code: string): Promise<User | null> {
    const result = await this.prisma.emailConfirmation.findFirst({
      where: {
        confirmationCode: code,
      },
    });
    if (!result) {
      return null;
    } else {
      return this.prisma.user.findFirst({
        where: { id: result.userId },
      });
    }
  }

  async getUserByCodeForLogin(code: string): Promise<User | null> {
    const result = await this.prisma.emailConfirmation.findFirst({
      where: {
        codeForLogin: code,
      },
    });
    if (!result) {
      return null;
    } else {
      return this.prisma.user.findFirst({
        where: { id: result.userId },
      });
    }
  }
}
