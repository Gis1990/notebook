import { ErrorResponse } from '../../src/modules/auth/dto/response-dto/errors.response';

export type TLoginResponse = {
  accessToken: string;
  refreshToken: string;
  body: ErrorResponse;
  status: number;
};
