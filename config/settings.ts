import * as dotenv from 'dotenv';
dotenv.config();

export const settings = {
  secret: {
    ACCESS_TOKEN: process.env.JWT_ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN: process.env.JWT_REFRESH_TOKEN_SECRET,
  },
  timeLife: {
    CONFIRMATION_CODE: 24 * 60 * 60 * 1000, // 24 hours
    TOKEN_TIME: 24 * 60 * 60 * 1000, // 24 hours
    ACCESS_TOKEN: '10 hours',
    REFRESH_TOKEN: '20 hours',
  },
};
