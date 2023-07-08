import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TFullUser } from '../../test/types/full-user.type';

@Injectable()
export class TestingRepository {
  constructor(private prisma: PrismaService) {}

  async deleteAll() {
    await this.prisma.emailConfirmation.deleteMany({});
    await this.prisma.contact.deleteMany({});
    await this.prisma.user.deleteMany({});
  }

  async getUser(userId: string): Promise<TFullUser> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        EmailConfirmation: true,
      },
    });

    return user;
  }
}
