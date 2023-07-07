import { Injectable } from '@nestjs/common';
import { Contact, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from '../modules/contacts/dto/create-contact.dto';
import { UpdateContactDto } from '../modules/contacts/dto/update-contact.dto';

@Injectable()
export class ContactRepository {
  constructor(private prisma: PrismaService) {}

  async createContact(dto: CreateContactDto, userId: string): Promise<Contact> {
    const contactData: Prisma.ContactCreateInput = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      user: { connect: { id: userId } },
    };

    return this.prisma.contact.create({
      data: contactData,
    });
  }

  async updateContact(
    dto: UpdateContactDto,
    contactId: string,
  ): Promise<boolean> {
    const result = await this.prisma.contact.update({
      where: { id: contactId },
      data: { ...dto },
    });

    return typeof result !== null;
  }

  async deleteContact(contactId: string): Promise<boolean> {
    const result = await this.prisma.contact.delete({
      where: { id: contactId },
    });
    return typeof result !== null;
  }

  async saveContactsFromCsv(
    dto: CreateContactDto[],
    userId: string,
  ): Promise<Prisma.BatchPayload> {
    const contactsToCreate = dto.map((fileDto) => ({
      firstName: fileDto.firstName,
      lastName: fileDto.lastName,
      email: fileDto.email,
      phoneNumber: fileDto.phoneNumber,
      userId: userId,
    }));
    return this.prisma.contact.createMany({
      data: contactsToCreate,
    });
  }
}
