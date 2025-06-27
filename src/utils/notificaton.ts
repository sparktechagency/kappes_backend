/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
import { INotification } from '../app/modules/notification/notification.interface';
import { Notification } from '../app/modules/notification/notification.model';

export const sendNotifications = async (data: any): Promise<INotification> => {
     const result = await Notification.create(data);
     console.log('111=', result);
     //@ts-ignore
     const socketIo = global.io;
     if (socketIo) {
          socketIo.emit(`notification::${data?.receiver}`, result);
     }

     return result;
};
