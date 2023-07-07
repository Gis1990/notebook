import { ApiProperty } from '@nestjs/swagger';
import { userValidationConstant } from './user-validation.constant';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsEmailExistForRegistration } from '../decorators/email.decorator';

export class RegistrationDto {
  @ApiProperty({ example: 'somemail@mail.com', description: 'User`s email' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  @IsEmailExistForRegistration()
  email: string;

  @ApiProperty({
    example: 'qwerty123',
    description: 'User`s password',
    minLength: userValidationConstant.passwordLength.min,
    maxLength: userValidationConstant.passwordLength.max,
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(
    userValidationConstant.passwordLength.min,
    userValidationConstant.passwordLength.max,
  )
  password: string;
}
