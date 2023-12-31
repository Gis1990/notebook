import request from 'supertest';
import { TestResponse } from '../types/test-response';
import { GetAllContactsDto } from '../../src/modules/contacts/dto/get-all-contacts.dto';
import { Contact } from '@prisma/client';
import { CreateContactDto } from '../../src/modules/contacts/dto/create-contact.dto';
import { UpdateContactDto } from '../../src/modules/contacts/dto/update-contact.dto';
import { UploadedFile } from '@nestjs/common';

export class ContactRequest {
  constructor(private readonly server: any) {}

  async getAllContacts(
    getAllContactsDto: GetAllContactsDto,
    accessToken: string,
  ): Promise<TestResponse<Contact[]>> {
    const response = await request(this.server)
      .get('/contacts')
      .set('authorization', 'Bearer ' + accessToken)
      .send(getAllContactsDto);
    return { body: response.body, status: response.status };
  }

  async createContact(
    createContactDto: CreateContactDto,
    accessToken: string,
  ): Promise<TestResponse<Contact>> {
    const response = await request(this.server)
      .post('/contacts')
      .set('authorization', 'Bearer ' + accessToken)
      .send(createContactDto);
    return { body: response.body, status: response.status };
  }

  async updateContact(
    updateContactDto: UpdateContactDto,
    contactId: string,
    accessToken: string,
  ): Promise<TestResponse<boolean>> {
    const response = await request(this.server)
      .put(`/contacts/${contactId}`)
      .set('authorization', 'Bearer ' + accessToken)
      .send(updateContactDto);
    return { body: response.body, status: response.status };
  }

  async deleteContact(
    contactId: string,
    accessToken: string,
  ): Promise<TestResponse<boolean>> {
    const response = await request(this.server)
      .delete(`/contacts/${contactId}`)
      .set('authorization', 'Bearer ' + accessToken);
    return { body: response.body, status: response.status };
  }

  async uploadCsvFile(
    file: any,
    accessToken: string,
  ): Promise<TestResponse<boolean>> {
    const csvFileName = 'test.csv';
    const response = await request(this.server)
      .post(`/contacts/upload-file`)
      .set('content-type', 'multipart/form-data')
      .set('authorization', 'Bearer ' + accessToken)
      .attach('file', Buffer.from(file), csvFileName);
    return { body: response.body, status: response.status };
  }

  async downloadCsvFile(accessToken: string): Promise<TestResponse<boolean>> {
    const response = await request(this.server)
      .get(`/contacts/download-file`)
      .set('authorization', 'Bearer ' + accessToken);
    return { body: response.body, status: response.status };
  }
}
