import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserByEmailCommand } from '../../../cqrs/queries/auth/get-user-by-email-query';

@ValidatorConstraint({ name: 'IsEmailExist', async: true })
@Injectable()
export class IsEmailExistConstraint implements ValidatorConstraintInterface {
  constructor(private queryBus: QueryBus) {}

  async validate(value: string) {
    const user = await this.queryBus.execute(new GetUserByEmailCommand(value));
    if (!user) {
      throw new UnauthorizedException();
    }
    return !!user;
  }
}

export function IsEmailExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailExistConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsEmailExistForRegistration', async: true })
@Injectable()
export class IsEmailExistForRegistrationConstraint
  implements ValidatorConstraintInterface
{
  constructor(private queryBus: QueryBus) {}

  async validate(value: string) {
    const user = await this.queryBus.execute(new GetUserByEmailCommand(value));
    return !user;
  }
  defaultMessage(args: ValidationArguments) {
    return `${args.property} already exists.`;
  }
}

export function IsEmailExistForRegistration(
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailExistForRegistrationConstraint,
    });
  };
}
