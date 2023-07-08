import { faker } from '@faker-js/faker';
import { userValidationConstant } from '../../src/modules/auth/dto/user-validation.constant';
const validEmail = 'somemail@gmail.com';
const validPassword = 'qwerty123';
const minPasswordLength = userValidationConstant.passwordLength.min;
const maxPasswordLength = userValidationConstant.passwordLength.max;
const shortPassword = faker.string.alpha({
  length: { min: minPasswordLength - 1, max: minPasswordLength - 1 },
});
const longPassword = faker.string.alpha({
  length: { min: maxPasswordLength + 1, max: maxPasswordLength + 1 },
});

export const preparedRegistrationData = {
  valid: {
    email: validEmail,
    password: validPassword,
  },
  incorrect: {
    short: {
      email: 'somemailgmail.com',
      password: shortPassword,
      passwordConfirmation: shortPassword,
    },
    long: {
      email: 'somemailgmail.com',
      password: longPassword,
      passwordConfirmation: longPassword,
    },
  },
};

export const preparedLoginData = {
  valid: {
    email: validEmail,
    password: validPassword,
  },
  incorrect: {
    email: validEmail + 1,
    password: validPassword + 1,
  },
};
