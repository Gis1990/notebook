import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Contact } from '@prisma/client';
import { GetAllContactsDto } from '../modules/contacts/dto/get-all-contacts.dto';

@Injectable()
export class ContactQueryRepository {
  constructor(private prisma: PrismaService) {}

  async getAllContacts(
    userId: string,
    dto: GetAllContactsDto,
  ): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      where: {
        userId: userId,
        firstName: { contains: dto.searchFirstNameTerm },
        lastName: { contains: dto.searchLastNameTerm },
      },
    });
  }

  async getAllContactsForSuperAdmin(
    dto: GetAllContactsDto,
  ): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      where: {
        firstName: { contains: dto.searchFirstNameTerm },
        lastName: { contains: dto.searchLastNameTerm },
      },
    });
  }

  async getContactById(contactId: string): Promise<Contact | null> {
    return this.prisma.contact.findUnique({
      where: { id: contactId },
    });
  }
}
