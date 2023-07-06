import { Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

@Controller('contacts')
export class ContactsController {
  constructor(private commandBus: CommandBus, private queryBus: QueryBus) {}
}
