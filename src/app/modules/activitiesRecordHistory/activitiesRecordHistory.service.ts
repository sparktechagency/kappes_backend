import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IactivitiesRecordHistory } from './activitiesRecordHistory.interface';
import { ActivitiesRecordHistory } from './activitiesRecordHistory.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { IJwtPayload } from '../auth/auth.interface';

const createActivitiesRecordHistory = async (payload: Partial<IactivitiesRecordHistory>, user: IJwtPayload) => {
     const isExistRecord = await ActivitiesRecordHistory.findOne({
          moduleDocumentId: payload.moduleDocumentId,
          historyOfModule: payload.historyOfModule,
          userId: user.id,
     });

     if (isExistRecord) {
          return isExistRecord;
     }
     const payloadData = { ...payload, userId: user.id };
     const result = await ActivitiesRecordHistory.create(payloadData);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'ActivitiesRecordHistory not found.');
     }
     return result;
};

const getAllActivitiesRecordHistorys = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number }; result: IactivitiesRecordHistory[] }> => {
     console.log('first');
     const queryBuilder = new QueryBuilder(ActivitiesRecordHistory.find().populate('moduleDocumentId'), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedActivitiesRecordHistorys = async (): Promise<IactivitiesRecordHistory[]> => {
     const result = await ActivitiesRecordHistory.find().populate('moduleDocumentId');
     return result;
};

const hardDeleteActivitiesRecordHistory = async (id: string, user: IJwtPayload): Promise<IactivitiesRecordHistory | null> => {
     const isExistRecord = await ActivitiesRecordHistory.findOne({ _id: id, userId: user.id });
     if (!isExistRecord) {
          throw new AppError(StatusCodes.NOT_FOUND, 'You are not authorized to delete this tracking record.');
     }
     const result = await ActivitiesRecordHistory.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'ActivitiesRecordHistory not found.');
     }
     return result;
};

const getActivitiesRecordHistoryById = async (id: string, user: IJwtPayload): Promise<IactivitiesRecordHistory | null> => {
     const isExit = await ActivitiesRecordHistory.findOne({ _id: id, userId: user.id }).populate('moduleDocumentId');
     return isExit;
};

export const activitiesRecordHistoryService = {
     createActivitiesRecordHistory,
     getAllActivitiesRecordHistorys,
     getAllUnpaginatedActivitiesRecordHistorys,
     hardDeleteActivitiesRecordHistory,
     getActivitiesRecordHistoryById,
};
