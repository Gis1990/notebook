import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetContactByIdCommand } from '../../../cqrs/queries/contacts/get-contact-by-id.query';

@ValidatorConstraint({ name: 'IsContactIdExist', async: true })
@Injectable()
export class IsContactIdExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private queryBus: QueryBus) {}

  async validate(value: string) {
    const contact = await this.queryBus.execute(
      new GetContactByIdCommand(value),
    );
    if (!contact) {
      throw new NotFoundException(`Contact not found.`);
    } else {
      return true;
    }
  }
  defaultMessage(args: ValidationArguments) {
    return `Incorrect ${args.property}.`;
  }
}

export function IsContactIdExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsContactIdExistConstraint,
    });
  };
}
