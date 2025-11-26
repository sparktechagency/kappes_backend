// import admin from 'firebase-admin';
// import { getMessaging } from 'firebase-admin/messaging';
// import { StatusCodes } from 'http-status-codes';
// import dotenv from 'dotenv';
// import config from '../../../../config';
// import AppError from '../../../../errors/AppError';
// import { Buffer } from 'buffer';

// // Load environment variables
// dotenv.config();

// const base64key = config.firebase_service_account_key!;
// if (!base64key) {
//      throw new AppError(StatusCodes.NOT_FOUND, 'Firebase service account key is not provided in environment variables');
// }

// // Decode base64-encoded service account JSON
// const serviceAccount = JSON.parse(Buffer.from(base64key, 'base64').toString('utf-8'));
// console.log("🚀 ~ serviceAccount:", serviceAccount)

// if (!admin.apps.length) {
//      admin.initializeApp({
//           credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
//      });
// }

// export default admin;

// interface message {
//      notification: {
//           title: string;
//           body: any;
//      };
//      data?: any;
//      token: string;
// }

// export const messageSend = async (msg: message) => {
//      console.log('🚀 ~ messageSend ~ msg:', msg);
//      try {
//           const response = await getMessaging().send(msg);
//           console.log('Message sent successfully:', response);
//           return {
//                message: 'Successfully sent the message',
//                status: true,
//           };
//      } catch (error) {
//           console.log(error);
//           throw new AppError(StatusCodes.EXPECTATION_FAILED, 'Error hapending on the push message');
//      }
// };

import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { StatusCodes } from 'http-status-codes';
import dotenv from 'dotenv';
import config from '../../../../config';
import AppError from '../../../../errors/AppError';
import { Buffer } from 'buffer';

dotenv.config();

// Base64 Decode Service Account
const base64key = config.firebase_service_account_key;
if (!base64key) {
     throw new AppError(StatusCodes.NOT_FOUND, 'Firebase service account key is not provided in environment variables');
}

const serviceAccount = JSON.parse(Buffer.from(base64key, 'base64').toString('utf-8'));

if (!admin.apps.length) {
     admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
     });
}

export default admin;

interface IMessage {
     notification: {
          title: string;
          body: string;
     };
     data?: Record<string, string>;
     token: string;
}

export const messageSend = async (msg: IMessage) => {
     try {
          const res = await getMessaging().send(msg);
          console.log('Message sent:', res);
          return { status: true, message: 'Message sent successfully' };
     } catch (error) {
          console.log('FCM Error:', error);
          throw new AppError(StatusCodes.EXPECTATION_FAILED, 'Firebase push notification failed');
     }
};
