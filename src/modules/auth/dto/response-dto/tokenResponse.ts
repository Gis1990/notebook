import { ApiProperty } from '@nestjs/swagger';

export class TokenResponse {
  @ApiProperty({
    type: String,
    description: 'Access token for contacts',
  })
  accessToken: string;
}
