import { USER_ROLES } from '../app/modules/user/user.enums';

export type IVerifyEmail = {
     email: string;
     oneTimeCode: number;
};

export type ILoginData = {
     email: string;
     password?: string;
     roles?: USER_ROLES[];
     fmcToken?: string;
};

export type IAuthResetPassword = {
     newPassword: string;
     confirmPassword: string;
};

export type IChangePassword = {
     currentPassword: string;
     newPassword: string;
     confirmPassword: string;
};
