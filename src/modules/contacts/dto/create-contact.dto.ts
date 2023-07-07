import { IsEmail, IsMobilePhone, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateContactDto {
  @ApiProperty({ example: 'James', description: 'First name for contact' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ example: 'Bond', description: 'Last name for contact' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({
    example: 'somemail@mail.com',
    description: 'Email for contact',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value?.trim())
  email: string;

  @ApiProperty({
    example: '007007007',
    description: 'Phone number for contact',
  })
  @IsNotEmpty()
  @IsString()
  @IsMobilePhone()
  @Transform(({ value }) => value?.trim())
  phoneNumber: string;
}
