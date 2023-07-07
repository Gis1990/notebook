import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserByConfirmationCodeCommand } from '../../../cqrs/queries/auth/get-user-by-confirmation-code-query';

@ValidatorConstraint({ name: 'IsConfirmationCodeExist', async: true })
@Injectable()
export class IsConfirmationCodeExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private queryBus: QueryBus) {}

  async validate(value: string) {
    const user = await this.queryBus.execute(
      new GetUserByConfirmationCodeCommand(value),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.isConfirmed) {
      throw new UnauthorizedException();
    }
    return !!user;
  }
  defaultMessage(args: ValidationArguments) {
    return `Incorrect ${args.property}.`;
  }
}

export function IsConfirmationCodeExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsConfirmationCodeExistConstraint,
    });
  };
}
