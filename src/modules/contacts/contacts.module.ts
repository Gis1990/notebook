import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ContactsController } from './contacts.controller';

const commandHandlers = [];
const queryHandlers = [];

@Module({
  imports: [CqrsModule],
  controllers: [ContactsController],
  providers: [...commandHandlers, ...queryHandlers],
  exports: [],
})
export class ContactsModule {}
