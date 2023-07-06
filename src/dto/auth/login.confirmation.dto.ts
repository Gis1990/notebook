import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { IsEmailExist } from '../../decorators/email.decorator';
import { IsCodeForLoginExist } from '../../decorators/login-code.decorator';

export class LoginConfirmationDto {
  @ApiProperty({ example: 'somemail@mail.com', description: 'User`s email' })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsEmailExist()
  email: string;

  @ApiProperty({
    description: 'Code for login',
  })
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsCodeForLoginExist()
  codeForLogin: string;
}
