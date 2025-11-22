import { USER_ROLES } from '../app/modules/user/user.enums';

export type IVerifyEmail = {
     email: string;
     oneTimeCode: number;
};

export type ILoginData = {
     email: string;
     password?: string;
     role?: USER_ROLES;
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
