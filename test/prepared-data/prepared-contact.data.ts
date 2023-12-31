import { randomUUID } from 'crypto';

const validFirstName = 'Alex';
const validLastName = 'Smith';
const validEmail = 'someemail@gmail.com';
const validPhoneNumber = '910999000';
const validUserId = randomUUID().toString();
const invalidEmail = 'someemailgmail.com';

export const preparedContactData = {
  valid: {
    firstName: validFirstName,
    lastName: validLastName,
    email: validEmail,
    phoneNumber: validPhoneNumber,
  },
  incorrect: {
    firstName: validFirstName,
    lastName: validLastName,
    email: invalidEmail,
    phoneNumber: validPhoneNumber,
  },
  forUpdate: {
    firstName: validFirstName + '-updated',
    lastName: validLastName,
    email: validEmail,
    phoneNumber: validPhoneNumber,
  },
};

export const preparedGetAllContactsData = {
  searchFirstNameTerm: null,
  searchLastNameTerm: null,
};

export const preparedUserId = {
  userId: validUserId,
};

export const preparedContactId = {
  id: validUserId,
};
