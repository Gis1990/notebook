import { IsEmail, IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateContactDto {
  @ApiProperty({
    example: 'Jason',
    description: 'First name for contact update',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'Born', description: 'Last name for contact update' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({
    example: 'somemail@mail.com',
    description: 'Email for contact update',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email: string;

  @ApiProperty({
    example: '008008008',
    description: 'Phone number for contact update',
  })
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone()
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;
}
