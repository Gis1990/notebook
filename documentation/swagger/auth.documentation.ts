import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ViewUser } from '../../src/modules/auth/entities/user-view.schema';
import { RegistrationDto } from '../../src/modules/auth/dto/registration.dto';
import { ErrorResponse } from '../../src/modules/auth/dto/response-dto/errors.response';
import { LoginDto } from '../../src/modules/auth/dto/login.dto';
import { LoginConfirmationDto } from '../../src/modules/auth/dto/login.confirmation.dto';
import { TokenResponse } from '../../src/modules/auth/dto/response-dto/tokenResponse';
import { RegistrationConfirmationDto } from '../../src/modules/auth/dto/registration-confirmation.dto';
import { SaPermissionDto } from '../../src/modules/auth/dto/sa-permission.dto';

export function ApiRegistration() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'A new contacts is registered in the system' }),
    ApiBody({
      type: RegistrationDto,
      required: true,
    }),
    ApiCreatedResponse({
      description:
        'Input data is accepted. Email with confirmation code will be send to' +
        ' passed email address.',
      type: ViewUser,
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect values (in particular if the contacts with' +
        ' the given email or password already exists)',
      type: ErrorResponse,
    }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({ summary: 'Login contacts after registration' }),
    ApiBody({ type: LoginDto }),
    ApiNoContentResponse({
      description:
        'Input data is accepted. Email with login code will be send to' +
        ' passed email address.',
    }),
    ApiUnauthorizedResponse({
      description:
        'if a contacts with such an email does not exist or the password' +
        ' is not suitable for the profile registered with this email',
    }),
  );
}

export function ApiLoginConfirmation() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Confirmation of login via login code',
    }),
    ApiBody({
      type: LoginConfirmationDto,
      required: true,
    }),
    ApiOkResponse({
      description:
        'Returns JWT accessToken (expired after 1 hour) in body and JWT' +
        ' refreshToken in cookie (http-only, secure) (expired after 24 hours)',
      type: TokenResponse,
    }),
    ApiBadRequestResponse({
      description: 'If login code is incorrect or expired.',
      type: ErrorResponse,
    }),
  );
}

export function ApiRegistrationConfirmation() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Confirmation of registration via confirmation code',
    }),
    ApiQuery({
      type: RegistrationConfirmationDto,
      required: true,
    }),
    ApiNoContentResponse({
      description: 'Email was verified. Account was activated',
    }),
    ApiUnauthorizedResponse({
      description: 'if confirmation code is incorrect',
    }),
  );
}

export function ApiGiveUserSuperAdminPermission() {
  return applyDecorators(
    ApiTags('Auth'),
    ApiOperation({
      summary: 'Giving super admin permission to user',
    }),
    ApiBody({
      type: SaPermissionDto,
      required: true,
    }),
    ApiNoContentResponse({
      description: 'Data accepted. Super admin permission was given to user',
    }),
    ApiBadRequestResponse({
      description: 'If login code is incorrect or expired.',
      type: ErrorResponse,
    }),
  );
}
