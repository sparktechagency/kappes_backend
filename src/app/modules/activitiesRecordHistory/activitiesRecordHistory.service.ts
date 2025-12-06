import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IactivitiesRecordHistory } from './activitiesRecordHistory.interface';
import { ActivitiesRecordHistory } from './activitiesRecordHistory.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';

const createActivitiesRecordHistory = async (payload: IactivitiesRecordHistory): Promise<IactivitiesRecordHistory> => {
     const result = await ActivitiesRecordHistory.create(payload);
     if (!result) {
          if(payload.image){
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'ActivitiesRecordHistory not found.');
     }
     return result;
};

const getAllActivitiesRecordHistorys = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number; }; result: IactivitiesRecordHistory[]; }> => {
     const queryBuilder = new QueryBuilder(ActivitiesRecordHistory.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedActivitiesRecordHistorys = async (): Promise<IactivitiesRecordHistory[]> => {
     const result = await ActivitiesRecordHistory.find();
     return result;
};

const updateActivitiesRecordHistory = async (id: string, payload: Partial<IactivitiesRecordHistory>): Promise<IactivitiesRecordHistory | null> => {
     const isExist = await ActivitiesRecordHistory.findById(id);
     if (!isExist) {
          if(payload.image){
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'ActivitiesRecordHistory not found.');
     }

     if(isExist.image){
          unlinkFile(isExist.image);
     }
     return await ActivitiesRecordHistory.findByIdAndUpdate(id, payload, { new: true });
};

const deleteActivitiesRecordHistory = async (id: string): Promise<IactivitiesRecordHistory | null> => {
     const result = await ActivitiesRecordHistory.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'ActivitiesRecordHistory not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteActivitiesRecordHistory = async (id: string): Promise<IactivitiesRecordHistory | null> => {
     const result = await ActivitiesRecordHistory.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'ActivitiesRecordHistory not found.');
     }
     if(result.image){
          unlinkFile(result.image);
     }
     return result;
};

const getActivitiesRecordHistoryById = async (id: string): Promise<IactivitiesRecordHistory | null> => {
     const result = await ActivitiesRecordHistory.findById(id);
     return result;
};   

export const activitiesRecordHistoryService = {
     createActivitiesRecordHistory,
     getAllActivitiesRecordHistorys,
     getAllUnpaginatedActivitiesRecordHistorys,
     updateActivitiesRecordHistory,
     deleteActivitiesRecordHistory,
     hardDeleteActivitiesRecordHistory,
     getActivitiesRecordHistoryById
};
