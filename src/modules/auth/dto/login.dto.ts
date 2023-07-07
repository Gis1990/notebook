import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';
import { userValidationConstant } from './user-validation.constant';
import { IsEmailExist } from '../decorators/email.decorator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsEmailExist()
  email: string;

  @ApiProperty({
    minLength: userValidationConstant.passwordLength.min,
    maxLength: userValidationConstant.passwordLength.max,
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(
    userValidationConstant.passwordLength.min,
    userValidationConstant.passwordLength.max,
  )
  password: string;
}
