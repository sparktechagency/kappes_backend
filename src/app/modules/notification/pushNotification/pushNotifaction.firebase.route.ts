// import express from 'express';
// import { USER_ROLES } from '../../user/user.enums';
// import auth from '../../../middleware/auth';
// const router = express.Router();
// import { StatusCodes } from 'http-status-codes';
// import sendResponse from '../../../../shared/sendResponse';
// import catchAsync from '../../../../shared/catchAsync';
// import { User } from '../../user/user.model';
// import AppError from '../../../../errors/AppError';
// import { messageSend } from './firebaseHelper';
// import { IJwtPayload } from '../../auth/auth.interface';
// import { z } from 'zod';
// import validateRequest from '../../../middleware/validateRequest';

// export const firebasePushNotificationZodSchema = z.object({
//      body: z.object({
//           title: z.string({ required_error: 'Title is required' }),
//           body: z.string({ required_error: 'Message Body is required' }),
//           roles: z.array(z.nativeEnum(USER_ROLES)),
//           additionalData: z.string().optional(),
//      }),
// });

// router.post(
//      '/send-notification',
//      validateRequest(firebasePushNotificationZodSchema),
//      auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
//      catchAsync(async (req, res) => {
//           const { title, body, roles, additionalData } = req.body;
//           const result = await firebasePushNotificationController({ title, body, roles, additionalData }, req.user as IJwtPayload);

//           sendResponse(res, {
//                success: true,
//                statusCode: StatusCodes.OK,
//                message: 'Push notification sent successfully',
//                data: result,
//           });
//      }),
// );

// const firebasePushNotificationController = async ({ title, body, roles, additionalData }: { title: string; body: string; roles: USER_ROLES; additionalData: string }, user: IJwtPayload) => {
//      const sender = await User.findById(user.id).select('full_name');

//      const users = await User.find({ role: { $in: roles } }).select('+fmcToken');

//      if (!users) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'Users not found!');
//      }

//      const userfmcTokens = users.map((user: any) => user.fmcToken).filter((fmcToken: string) => fmcToken !== null && fmcToken !== undefined);
//      console.log('🚀 ~ firebasePushNotificationController ~ userfmcTokens:', userfmcTokens);

//      if (!userfmcTokens.length) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'User device ID not found!');
//      }

//      userfmcTokens.forEach(async (fmcToken: string) => {
//           await messageSend({
//                notification: {
//                     title: title || `${sender!.full_name} send you a message`,
//                     body: `${body}`,
//                },
//                data: {
//                     additionalData: additionalData || 'AdditionalData N/A',
//                },
//                token: fmcToken,
//           });
//      });
// };

// export const firebasePushNotificationRoutes = router;

import express from 'express';
import { USER_ROLES } from '../../user/user.enums';
import auth from '../../../middleware/auth';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../../shared/sendResponse';
import catchAsync from '../../../../shared/catchAsync';
import { User } from '../../user/user.model';
import AppError from '../../../../errors/AppError';
import { messageSend } from './firebaseHelper';
import { IJwtPayload } from '../../auth/auth.interface';
import { z } from 'zod';
import validateRequest from '../../../middleware/validateRequest';

const router = express.Router();

export const firebasePushNotificationZodSchema = z.object({
     body: z.object({
          title: z.string(),
          body: z.string(),
          roles: z.array(z.nativeEnum(USER_ROLES)),
          additionalData: z.string().optional(),
     }),
});

router.post(
     '/send-notification',
     validateRequest(firebasePushNotificationZodSchema),
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
     catchAsync(async (req, res) => {
          const { title, body, roles, additionalData } = req.body;

          const result = await firebasePushNotificationController({ title, body, roles, additionalData }, req.user as IJwtPayload);

          sendResponse(res, {
               success: true,
               statusCode: StatusCodes.OK,
               message: 'Push notification sent successfully',
               data: result,
          });
     }),
);

const firebasePushNotificationController = async (
     {
          title,
          body,
          roles,
          additionalData,
     }: {
          title: string;
          body: string;
          roles: USER_ROLES[];
          additionalData?: string;
     },
     user: IJwtPayload,
) => {
     const sender = await User.findById(user.id).select('full_name');

     const users = await User.find({ role: { $in: roles } }).select('+fmcToken');

     if (!users || !users.length) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Users not found!');
     }

     const tokens = users.map((u: any) => u.fmcToken).filter((t: string) => !!t);

     if (!tokens.length) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Valid FCM tokens not found!');
     }

     for (const token of tokens) {
          await messageSend({
               notification: {
                    title: title || `${sender?.full_name} sent you a message`,
                    body,
               },
               data: {
                    additionalData: additionalData || '',
               },
               token,
          });
     }

     return { sentTo: tokens.length };
};

export const firebasePushNotificationRoutes = router;
