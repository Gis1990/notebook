import { ErrorResponse } from '../../src/modules/auth/dto/response-dto/errors.response';

export const errorsMessage = <T>(fields: (keyof T)[]): ErrorResponse => {
  const errors = [];

  for (const field of fields) {
    errors.push({
      message: expect.any(String),
      field: field as string,
    });
  }

  return { errors };
};
