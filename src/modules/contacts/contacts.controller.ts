import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Contact } from '@prisma/client';
import { AuthBearerGuard } from '../../guards/auth-bearer.guard';
import { GetAllContactsDto } from './dto/get-all-contacts.dto';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GetAllContactsCommand } from '../../cqrs/queries/contacts/get-all-contacts-query';
import { CreateContactCommand } from '../../cqrs/commands/contacts/create-contact.command-handler';
import { ContactIdValidationDto } from './dto/contact-id-validation.dto';
import { UpdateContactCommand } from '../../cqrs/commands/contacts/update-contact-by-id.command-handler';
import { DeleteContactCommand } from '../../cqrs/commands/contacts/delete-contact-by-id.command-handler';
import { FileInterceptor } from '@nestjs/platform-express';
import csv from 'csvtojson';
import { SaveContactsFromScvCommand } from '../../cqrs/commands/contacts/save-contacts-from-scv-file.command-handler';
import { ConvertContactsToCsvCommand } from '../../cqrs/commands/contacts/convert-contacts-to-scv.command-handler';

@Controller('contacts')
export class ContactsController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}

  @Get()
  @UseGuards(AuthBearerGuard)
  @HttpCode(HttpStatus.OK)
  async getAllContacts(
    @Query()
    dto: GetAllContactsDto,
    @CurrentUser() userId: string,
  ): Promise<Contact[]> {
    return await this.queryBus.execute(new GetAllContactsCommand(dto, userId));
  }

  @Post()
  @UseGuards(AuthBearerGuard)
  @HttpCode(HttpStatus.OK)
  async createContact(
    @Body() dto: CreateContactDto,
    @CurrentUser() userId: string,
  ): Promise<Contact> {
    return await this.commandBus.execute(new CreateContactCommand(dto, userId));
  }

  @Put(':id')
  @UseGuards(AuthBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateContact(
    @Body() dto: UpdateContactDto,
    @CurrentUser() userId: string,
    @Param() param: ContactIdValidationDto,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new UpdateContactCommand(dto, userId, param.id),
    );
  }

  @Delete(':id')
  @UseGuards(AuthBearerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContact(
    @CurrentUser() userId: string,
    @Param() param: ContactIdValidationDto,
  ): Promise<boolean> {
    return await this.commandBus.execute(
      new DeleteContactCommand(userId, param.id),
    );
  }

  @Post('upload-file')
  @UseGuards(AuthBearerGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() userId: string,
  ): Promise<Contact[]> {
    let result;
    try {
      const jsonArray = await csv().fromString(file.buffer.toString());
      result = await this.commandBus.execute(
        new SaveContactsFromScvCommand(jsonArray, userId),
      );
    } catch (error) {
      console.log(error);
    }
    return result;
  }

  @Get('download-file')
  @UseGuards(AuthBearerGuard)
  async downloadFile(@CurrentUser() userId: string): Promise<any> {
    const dto = {} as GetAllContactsDto;
    const contacts = await this.queryBus.execute(
      new GetAllContactsCommand(dto, userId),
    );
    return await this.commandBus.execute(
      new ConvertContactsToCsvCommand(contacts),
    );
  }
}
