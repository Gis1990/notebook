import { ViewUser } from '../../src/modules/auth/entities/user-view.schema';

export type UserWithTokensType = {
  user: ViewUser;
  accessToken: string;
  refreshToken: string;
};
