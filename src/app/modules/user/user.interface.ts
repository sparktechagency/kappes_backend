import { Model, Schema } from 'mongoose';
import { IGeoLocation } from '../business/business.interface';
import { USER_ROLES } from './user.enums';

export interface IRecentSearchLocation {
     locationName: string; // e.g., "New York City", "My Home Address"
     geoLocation?: IGeoLocation; // The coordinates (optional if only text searched)
     searchDate: Date; // When the search was performed
}

export type IUser = {
     googleId?: string;
     facebookId?: string;
     provider?: string;
     full_name: string;
     role: USER_ROLES;
     email: string;
     password: string;
     image?: string;
     phone?: string;
     joinDate: Date;
     isDeleted: boolean;
     address?:
          | {
                 province: string;
                 territory: string;
                 city: string;
                 country?: string;
                 detail_address?: string;
            }
          | string;
     business_informations: Schema.Types.ObjectId[];
     lastLogin: Date;
     tokenVersion: number;
     loginCount: number;
     stripeConnectedAccount?: string; // for getting payment as a vendor
     status: 'active' | 'blocked';
     verified: boolean;
     authentication?: {
          isResetPassword: boolean;
          oneTimeCode: number;
          expireAt: Date;
     };
     recentSearchLocations?: IRecentSearchLocation[];
     balance: number;
     // subscription related
     subscription: Schema.Types.ObjectId | null;
     isSubscribed: boolean;
     fmcToken?: string;
     stripeCustomerId: string; // for subscription or paying as service taker

     // chit chat

     name?: string;
     address_1?: string;
     city?: string;
     province_code?: string;
     postal_code?: string;
     country_code?: string;
};

export type UserModel = {
     isExistUserById(id: string): any;
     isExistUserByEmail(email: string): any;
     isExistUserByPhone(contact: string): any;
     isMatchPassword(password: string, hashPassword: string): boolean;
     isInFreeTrial(userId: string): Promise<boolean>;
     hasActiveSubscription(userId: string): Promise<boolean>;
     hasTrialExpired(userId: string): Promise<boolean>;
} & Model<IUser>;

export type ISellerUser = IUser & {
     store_name: string;
     store_category: string;
};
