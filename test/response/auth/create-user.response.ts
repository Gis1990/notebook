import { ViewUser } from '../../../src/modules/auth/entities/user-view.schema';

export const createUserResponse = (email: string): ViewUser => {
  return {
    id: expect.any(String),
    email,
    createdAt: expect.any(String),
  };
};
