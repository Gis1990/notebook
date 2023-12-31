import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { randomUUID } from 'crypto';
import { ErrorResponse } from '../../src/modules/auth/dto/response-dto/errors.response';

export class SwaggerContact {
  @ApiProperty({
    description: 'UUID',
    example: randomUUID(),
  })
  id: string;
  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  firstName: string;
  @ApiProperty({
    description: 'Last name',
    example: 'Smith',
  })
  lastName: string;
  @ApiProperty({ example: 'somemail@mail.com', description: 'Contact`s email' })
  email: string;
  @ApiProperty({ example: '789687595', description: 'Contact`s phone number' })
  phoneNumber: string;
  @ApiProperty({
    description: 'UUID',
    example: randomUUID(),
  })
  userId: string;
}

export class url {
  @ApiProperty({
    description: 'URL',
    example: 'https://notebooktoscvbucket.s3.eu-central-1.amazonaws.com',
  })
  urlForDownload: string;
}

export function ApiGetAllContacts() {
  return applyDecorators(
    ApiTags('Contacts'),
    ApiOperation({ summary: 'Get all contacts for current user' }),
    ApiOkResponse({
      description: 'Returns array of contacts for current user',
      type: [SwaggerContact],
    }),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'If the JWT accessToken is missing, expired or incorrect',
    }),
  );
}

export function ApiCreateContact() {
  return applyDecorators(
    ApiTags('Contacts'),
    ApiOperation({ summary: 'Create new entry for contact' }),
    ApiCreatedResponse({
      description: 'Returns new contact',
      type: SwaggerContact,
    }),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'If the JWT accessToken is missing, expired or incorrect',
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect values (in particular if the contacts with' +
        ' the given email or password already exists)',
      type: ErrorResponse,
    }),
  );
}

export function ApiUpdateContact() {
  return applyDecorators(
    ApiTags('Contacts'),
    ApiOperation({ summary: 'Update contact by id' }),
    ApiNoContentResponse({
      description: 'No content',
    }),
    ApiBearerAuth(),
    ApiNotFoundResponse({ description: 'Not found' }),
    ApiUnauthorizedResponse({
      description: 'If the JWT accessToken is missing, expired or incorrect',
    }),
    ApiForbiddenResponse({
      description:
        "If user try to update contact that doesn't belong to current user and user is not superAdmin",
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect values (in particular if the contacts with' +
        ' the given email or password already exists)',
      type: ErrorResponse,
    }),
  );
}

export function ApiDeleteContact() {
  return applyDecorators(
    ApiTags('Contacts'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete contact by id' }),
    ApiNoContentResponse({
      description: 'No content',
    }),
    ApiForbiddenResponse({
      description:
        "If user try to delete contact that doesn't belong to current user and user is not superAdmin",
    }),
    ApiNotFoundResponse({ description: 'Not found' }),
    ApiUnauthorizedResponse({
      description: 'If the JWT accessToken is missing, expired or incorrect',
    }),
  );
}

export function ApiUploadFile() {
  return applyDecorators(
    ApiTags('Contacts'),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Upload csv-for-test file for current user' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiNoContentResponse({
      description: 'File uploaded',
    }),
    ApiUnauthorizedResponse({
      description: 'If the JWT accessToken is missing, expired or incorrect',
    }),
  );
}

export function ApiDownloadFile() {
  return applyDecorators(
    ApiTags('Contacts'),
    ApiBearerAuth(),
    ApiOperation({
      summary:
        'Get link for downloading current users contacts in csv-for-test format',
    }),
    ApiOkResponse({
      description: 'Link for downloading csv-for-test file',
      type: url,
    }),
    ApiUnauthorizedResponse({
      description: 'If the JWT accessToken is missing, expired or incorrect',
    }),
  );
}
