import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAllContactsDto {
  @ApiProperty({
    type: String,
    description:
      'Search term for contact firstName: firstName should contains this term in any position',
    default: null,
    required: false,
  })
  @IsString()
  @IsOptional()
  searchFirstNameTerm: string;
  @ApiProperty({
    type: String,
    description:
      'Search term for contact lastName: lastName should contains this term in any position',
    default: null,
    required: false,
  })
  @IsString()
  @IsOptional()
  searchLastNameTerm: string;
}
