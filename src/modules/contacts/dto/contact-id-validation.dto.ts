import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsContactIdExist } from '../decorators/contact-id.decorator';

export class ContactIdValidationDto {
  @ApiProperty({ required: true, description: 'Id of the contact' })
  @IsString()
  @IsNotEmpty()
  @IsContactIdExist()
  id: string;
}
