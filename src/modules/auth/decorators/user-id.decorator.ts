import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserByIdCommand } from '../../../cqrs/queries/auth/get-user-by-id-query';

@ValidatorConstraint({ name: 'IsUserIdExist', async: true })
@Injectable()
export class IsUserIdExistConstraint implements ValidatorConstraintInterface {
  constructor(private queryBus: QueryBus) {}

  async validate(value: string) {
    const user = await this.queryBus.execute(new GetUserByIdCommand(value));
    return !!user;
  }
  defaultMessage(args: ValidationArguments) {
    return `Incorrect ${args.property}.`;
  }
}

export function IsUserIdExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUserIdExistConstraint,
    });
  };
}
