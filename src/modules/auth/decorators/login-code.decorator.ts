import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserByCodeForLoginCommand } from '../../../cqrs/queries/auth/get-user-by-code-for-login.query';

@ValidatorConstraint({ name: 'IsCodeForLoginExist', async: true })
@Injectable()
export class IsCodeForLoginExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private queryBus: QueryBus) {}

  async validate(value: string) {
    const user = await this.queryBus.execute(
      new GetUserByCodeForLoginCommand(value),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    return `Incorrect ${args.property}.`;
  }
}

export function IsCodeForLoginExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCodeForLoginExistConstraint,
    });
  };
}
