import { Contact } from '@prisma/client';

export const createContactsResponse = (
  firstName: string,
  lastName: string,
  email: string,
  phoneNumber: string,
): Contact => {
  return {
    id: expect.any(String),
    firstName,
    lastName,
    email,
    phoneNumber,
    userId: expect.any(String),
  };
};
