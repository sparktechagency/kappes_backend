// import { StatusCodes } from 'http-status-codes';
// import AppError from '../../../../errors/AppError';
// import { ChitChatShipment } from './chitChatShipment.model';
import { IchitChatShipment } from './chitChatShipment.interface';
import axios from 'axios';
import config from '../../../../config';

const createChitChatShipment = async (payload: IchitChatShipment) => {
     const apiRes = await axios.post(`https://chitchats.com/api/v1/clients/${config.chitchat.client_id}/shipments`, payload, {
          headers: {
               'Authorization': `${config.chitchat.access_token}`,
               'Content-Type': 'application/json',
          },
     });

     if (apiRes.status === 200) {
          return apiRes.data;
     }
};

const getAllChitChatShipments = async (query: Record<string, any>) => {
     const { page, limit, batch_id, package_type, from_date, to_date, q, status } = query;
     const apiRes = await axios.get(`https://chitchats.com/api/v1/clients/${config.chitchat.client_id}/shipments`, {
          headers: {
               Authorization: `${config.chitchat.access_token}`,
          },
          params: {
               page,
               limit,
               batch_id,
               package_type,
               from_date,
               to_date,
               q, // searchTerm
               status,
          },
     });

     if (apiRes.status === 200) {
          return apiRes.data;
     }
};


const hardDeleteChitChatShipmentByShipMentId = async (shipMentId: string) => {
     const apiRes = await axios.delete(`https://chitchats.com/api/v1/clients/${config.chitchat.client_id}/shipments/${shipMentId}`, {
          headers: {
               Authorization: `${config.chitchat.access_token}`,
          },
     });

     if (apiRes.status === 200) {
          return apiRes.data;
     }
};

const getChitChatShipmentByShipMentId = async (shipMentId: string) => {
     const apiRes = await axios.get(`https://chitchats.com/api/v1/clients/${config.chitchat.client_id}/shipments/${shipMentId}`, {
          headers: {
               Authorization: `${config.chitchat.access_token}`,
          },
     });

     if (apiRes.status === 200) {
          return apiRes.data;
     }
};

export const chitChatShipmentService = {
     createChitChatShipment,
     getAllChitChatShipments,
     hardDeleteChitChatShipmentByShipMentId,
     getChitChatShipmentByShipMentId,
};
