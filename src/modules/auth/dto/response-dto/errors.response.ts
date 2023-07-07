import { ApiProperty } from '@nestjs/swagger';

export class FieldError {
  @ApiProperty({
    type: String,
    description: 'Message with error explanation for certain field',
    nullable: true,
  })
  message: string;

  @ApiProperty({
    type: String,
    description: 'What field/property of input model has error',
    nullable: true,
  })
  field: string;
}

export class ErrorResponse {
  @ApiProperty({
    type: [FieldError],
    description:
      'Array of error messages for specific fields/properties of input model',
    nullable: true,
  })
  errors: FieldError[];
}
