import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { IsUserIdExist } from '../decorators/user-id.decorator';

export class SaPermissionDto {
  @ApiProperty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsUserIdExist()
  userId: string;
}
