import { ApiProperty } from '@nestjs/swagger';
import { IsConfirmationCodeExist } from '../decorators/confirmation-code.decorator';

export class RegistrationConfirmationDto {
  @ApiProperty({ description: 'Registration confirmation code' })
  @IsConfirmationCodeExist()
  confirmationCode: string;
}
