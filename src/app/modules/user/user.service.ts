import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../../config';
import stripe from '../../../config/stripe';
import AppError from '../../../errors/AppError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import generateOTP from '../../../utils/generateOTP';
import QueryBuilder from '../../builder/QueryBuilder';
import { Shop } from '../shop/shop.model';
import { stripeAccountService } from '../stripeAccount/stripeAccount.service';
import { USER_ROLES } from './user.enums';
import { ISellerUser, IUser } from './user.interface';
import { User } from './user.model';
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
          console.log("🚀 ~ createUserToDB ~ error:", error)
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create Stripe customer');
     }

     createUser.stripeCustomerId = stripeCustomer.id;
     await User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication, stripeCustomerId: stripeCustomer.id } });
     return createUser;
};

const createSellerUserToDB = async (payload: ISellerUser, host: string, protocol: string) => {
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
          await User.findOneAndUpdate({ _id: createUser[0]._id }, { $set: { authentication } }, { session });

          // Create Stripe customer
          let stripeCustomer;
          try {
               stripeCustomer = await stripe.customers.create({
                    email: createUser[0].email,
                    name: createUser[0].full_name,
               });
          } catch (error) {
               console.log("🚀 ~ createSellerUserToDB ~ error:", error)
               throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create Stripe customer');
          }

          createUser[0].stripeCustomerId = stripeCustomer.id;
          await User.findOneAndUpdate({ _id: createUser[0]._id }, { $set: { authentication, stripeCustomerId: stripeCustomer.id } }, { session });

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
               { session },
          );

          // Commit the transaction if all operations are successful
          await session.commitTransaction();
          session.endSession();

          const stripe_account_onboarding_url = await stripeAccountService.createConnectedStripeAccount(user, host, protocol);

          return { createUser: createUser[0], shop, stripe_account_onboarding_url };
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

const getAllRoleBasedUser = async () => {
     const result = await User.find({}, { _id: 1, role: 1, name: 1, email: 1 }).lean();

     const users = result.reduce<Record<USER_ROLES, { data: (typeof result)[0][]; count: number }>>(
          (acc, curr) => {
               const { role } = curr;

               // Ensure TypeScript understands the structure of acc
               if (acc[role]) {
                    acc[role].data.push(curr);
                    acc[role].count += 1;
               } else {
                    acc[role] = { count: 1, data: [curr] };
               }

               return acc;
          },
          {} as Record<USER_ROLES, { data: (typeof result)[0][]; count: number }>,
     );

     return users;
};

const getAllVendors = async (query: Record<string, unknown>) => {
     const queryBuilder = new QueryBuilder(User.find({ role: USER_ROLES.VENDOR }).select('full_name email phone'), query);
     const users = await queryBuilder.fields().filter().paginate().search(['name', 'email', 'phone']).sort().modelQuery.exec();
     const meta = await queryBuilder.countTotal();
     return {
          meta,
          users,
     };
};

const updateUserByIdToDB = async (id: string, payload: Partial<IUser>) => {
     const isExistUser = await User.isExistUserById(id);
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
          new: true,
     });

     return updateDoc;
};

const deleteUserByAdmin = async (id: string) => {
     const isExistUser = await User.isExistUserById(id);
     if (!isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
     }

     await User.findByIdAndUpdate(id, {
          $set: { isDeleted: true,email: `deleted_${isExistUser.email}` },
     });

     return true;
};

const makeAdmin = async (payload: Partial<IUser>) => {
     // 🏃‍♀️‍➡️
     const isExistUser = await User.findOne({ email: payload.email });
     if (isExistUser) {
          throw new AppError(StatusCodes.BAD_REQUEST, "User already exists!");
     }

     // make a verified user no need otp set role ADMIN
     const user = await User.create({
          ...payload,
          role: USER_ROLES.ADMIN,
          isVerified: true,
     });

     return user;
};

const editAdminInDB = async (id: string, payload: Partial<IUser>): Promise<IUser | null> => {
     // Check if user exists and is an admin
     const user = await User.findOne({ _id: id, role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } });
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Admin not found');
     }

     // Prevent changing role to non-admin roles
     if (payload.role && !Object.values([USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN]).includes(payload.role)) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Cannot change admin to non-admin role');
     }

     // Update the admin
     const updatedAdmin = await User.findByIdAndUpdate(id, payload, { new: true }).select('-password');
     return updatedAdmin;
};

const deleteAdminFromDB = async (id: string): Promise<IUser | null> => {
     // Check if user exists and is an admin (but not super admin)
     const user = await User.findOne({ _id: id, role: USER_ROLES.ADMIN });
     if (!user) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Admin not found or cannot be deleted');
     }

     // Delete the admin
     const deletedAdmin = await User.findByIdAndDelete(id);
     return deletedAdmin;
};

export const UserService = {
     createUserToDB,
     createSellerUserToDB,
     getUserProfileFromDB,
     editAdminInDB,
     deleteAdminFromDB,
     updateProfileToDB,
     createVendorToDB,
     deleteUser,
     verifyUserPassword,
     getAllRoleBasedUser,
     getAllVendors,
     updateUserByIdToDB,
     deleteUserByAdmin,
     makeAdmin,
};
