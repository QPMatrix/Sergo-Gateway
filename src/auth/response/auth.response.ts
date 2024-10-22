import { UserWithRolesAndVerify } from '@sergo/shared';

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  access_expire: string;
  refresh_expire: string;
  user: UserWithRolesAndVerify;
};
