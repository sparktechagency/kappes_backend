import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from './user.enums';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import { ISellerUser, IUser } from './user.interface';
import { User } from './user.model';
import AppError from '../../../errors/AppError';
import generateOTP from '../../../utils/generateOTP';
import stripe from '../../../config/stripe';
import mongoose, { Schema } from 'mongoose';
import config from '../../../config';
import { Shop } from '../shop/shop.model';
// create user
const createUserToDB = async (payload: IUser): Promise<IUser> => {
     //set role
     const user = await User.isExistUserByEmail(payload.email);
     if (user) {
          throw new AppError(StatusCodes.CONFLICT, 'Email already exists');
     }
     payload.role = USER_ROLES.USER;
     const createUser = await User.create(payload);
     if (!createUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
     }

     //send email
     const otp = generateOTP(4);
     const values = {
          name: createUser.full_name,
          otp: otp,
          email: createUser.email!,
     };
     const createAccountTemplate = emailTemplate.createAccount(values);
     emailHelper.sendEmail(createAccountTemplate);

     //save to DB
     const authentication = {
          oneTimeCode: otp,
          expireAt: new Date(Date.now() + Number(config.otp.otpExpiryTimeInMin) * 60000),
     };
     await User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication } });

     let stripeCustomer;
     try {
          stripeCustomer = await stripe.customers.create({
               email: createUser.email,
               name: createUser.full_name,
          });
     } catch (error) {
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create Stripe customer');
     }

     createUser.stripeCustomerId = stripeCustomer.id;
     await User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication, stripeCustomerId: stripeCustomer.id } });
     return createUser;
};

const createSellerUserToDB = async (payload: ISellerUser) => {
     const session = await mongoose.startSession();
     session.startTransaction();

     try {
          // Check if the email already exists
          const user = await User.isExistUserByEmail(payload.email);
          if (user) {
               throw new AppError(StatusCodes.CONFLICT, 'Email already exists');
          }

          // Set role and create the user
          payload.role = USER_ROLES.VENDOR;
          const createUser = await User.create([payload], { session }); // Pass session to ensure the operation is part of the transaction
          if (!createUser) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
          }

          // Send email (keeping it outside transaction for now, email sending is outside DB scope)
          const otp = generateOTP(4);
          const values = {
               name: createUser[0].full_name,
               otp: otp,
               email: createUser[0].email!,
          };
          const createAccountTemplate = emailTemplate.createAccount(values);
          emailHelper.sendEmail(createAccountTemplate);

          // Save authentication data in DB
          const authentication = {
               oneTimeCode: otp,
               expireAt: new Date(Date.now() + Number(config.otp.otpExpiryTimeInMin) * 60000),
          };
          await User.findOneAndUpdate(
               { _id: createUser[0]._id },
               { $set: { authentication } },
               { session }
          );

          // Create Stripe customer
          let stripeCustomer;
          try {
               stripeCustomer = await stripe.customers.create({
                    email: createUser[0].email,
                    name: createUser[0].full_name,
               });
          } catch (error) {
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create Stripe customer');
          }

          createUser[0].stripeCustomerId = stripeCustomer.id;
          await User.findOneAndUpdate(
               { _id: createUser[0]._id },
               { $set: { authentication, stripeCustomerId: stripeCustomer.id } },
               { session }
          );

          // Now create the shop
          const shop = await Shop.create(
               [
                    {
                         name: payload.store_name,
                         categories: [new mongoose.Types.ObjectId(payload.store_category)],
                         owner: createUser[0]._id,
                         email: createUser[0].email,
                         phone: createUser[0].phone,
                    },
               ],
               { session }
          );

          // Commit the transaction if all operations are successful
          await session.commitTransaction();
          session.endSession();

          return { createUser: createUser[0], shop };

     } catch (error) {
          // If any operation fails, abort the transaction
          await session.abortTransaction();
          session.endSession();
          throw error; // Rethrow the error to be handled outside
     }
};


// create Businessman
const createVendorToDB = async (payload: IUser): Promise<IUser> => {
     //set role
     payload.role = USER_ROLES.VENDOR;
     const createUser = await User.create(payload);
     if (!createUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
     }

     //send email
     const otp = generateOTP(4);
     const values = {
          name: createUser.full_name,
          otp: otp,
          email: createUser.email!,
     };
     const createAccountTemplate = emailTemplate.createAccount(values);
     emailHelper.sendEmail(createAccountTemplate);

     //save to DB
     const authentication = {
          oneTimeCode: otp,
          expireAt: new Date(Date.now() + 3 * 60000),
     };
     await User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication } });

     return createUser;
};
// create Admin
// const createAdminToDB = async (
//   payload: Partial<IUser>
// ): Promise<IUser> => {
//   //set role
//   payload.role = USER_ROLES.ADMIN;
//   const createAdmin = await User.create(payload);
//   if (!createAdmin) {
//     throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create admin');
//   }

//   //send email
//   const otp = generateOTP(6);
//   const values = {
//     name: createAdmin.full_name,
//     otp: otp,
//     email: createAdmin.email!,
//   };
//   const createAccountTemplate = emailTemplate.createAccount(values);
//   emailHelper.sendEmail(createAccountTemplate);

//   //save to DB
//   const authentication = {
//     oneTimeCode: otp,
//     expireAt: new Date(Date.now() + 3 * 60000),
//   };
//   await User.findOneAndUpdate(
//     { _id: createAdmin._id },
//     { $set: { authentication } }
//   );

//   return createAdmin;
// };

// get user profile
const getUserProfileFromDB = async (user: JwtPayload): Promise<Partial<IUser>> => {
     const { id } = user;
     const isExistUser = await User.isExistUserById(id);
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     return isExistUser;
};

// update user profile
const updateProfileToDB = async (user: JwtPayload, payload: Partial<IUser>): Promise<Partial<IUser | null>> => {
     const { id } = user;
     const isExistUser = await User.isExistUserById(id);
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     //unlink file here
     if (payload.image && isExistUser.image) {
          unlinkFile(isExistUser.image);
     }

     const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
          new: true,
     });

     return updateDoc;
};

const verifyUserPassword = async (userId: string, password: string) => {
     const user = await User.findById(userId).select('+password');
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found.');
     }
     const isPasswordValid = await User.isMatchPassword(password, user.password);
     return isPasswordValid;
};
const deleteUser = async (id: string) => {
     const isExistUser = await User.isExistUserById(id);
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     await User.findByIdAndUpdate(id, {
          $set: { isDeleted: true },
     });

     return true;
};

export const UserService = {
     createUserToDB,
     createSellerUserToDB,
     getUserProfileFromDB,
     updateProfileToDB,
     createVendorToDB,
     deleteUser,
     verifyUserPassword,
};
