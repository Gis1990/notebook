import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TestingRepository {
  constructor(private prisma: PrismaService) {}

  async deleteAll() {
    await this.prisma.emailConfirmation.deleteMany({});
    await this.prisma.contact.deleteMany({});
    await this.prisma.user.deleteMany({});
  }
}
