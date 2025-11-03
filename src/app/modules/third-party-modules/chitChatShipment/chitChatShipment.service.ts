import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import { IchitChatShipment } from './chitChatShipment.interface';
import { ChitChatShipment } from './chitChatShipment.model';
import QueryBuilder from '../../../builder/QueryBuilder';

const createChitChatShipment = async (payload: IchitChatShipment): Promise<IchitChatShipment> => {
     const result = await ChitChatShipment.create(payload);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'ChitChatShipment not found.');
     }
     return result;
};

const getAllChitChatShipments = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number; }; result: IchitChatShipment[]; }> => {
     const queryBuilder = new QueryBuilder(ChitChatShipment.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

// const getAllUnpaginatedChitChatShipments = async (): Promise<IchitChatShipment[]> => {
//      const result = await ChitChatShipment.find();
//      return result;
// };

// const updateChitChatShipment = async (id: string, payload: Partial<IchitChatShipment>): Promise<IchitChatShipment | null> => {
//      const isExist = await ChitChatShipment.findById(id);
//      if (!isExist) {
//           if(payload.image){
//                unlinkFile(payload.image);
//           }
//           throw new AppError(StatusCodes.NOT_FOUND, 'ChitChatShipment not found.');
//      }

//      if(isExist.image){
//           unlinkFile(isExist.image);
//      }
//      return await ChitChatShipment.findByIdAndUpdate(id, payload, { new: true });
// };

// const deleteChitChatShipment = async (id: string): Promise<IchitChatShipment | null> => {
//      const result = await ChitChatShipment.findById(id);
//      if (!result) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'ChitChatShipment not found.');
//      }
//      result.isDeleted = true;
//      result.deletedAt = new Date();
//      await result.save();
//      return result;
// };

const hardDeleteChitChatShipment = async (id: string): Promise<IchitChatShipment | null> => {
     const result = await ChitChatShipment.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'ChitChatShipment not found.');
     }
     return result;
};

const getChitChatShipmentById = async (id: string): Promise<IchitChatShipment | null> => {
     const result = await ChitChatShipment.findById(id);
     return result;
};   

export const chitChatShipmentService = {
     createChitChatShipment,
     getAllChitChatShipments,
     // getAllUnpaginatedChitChatShipments,
     // updateChitChatShipment,
     // deleteChitChatShipment,
     hardDeleteChitChatShipment,
     getChitChatShipmentById
};
