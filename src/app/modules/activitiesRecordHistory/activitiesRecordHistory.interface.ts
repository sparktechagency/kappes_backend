import { ActivitiesRecordHistoryCategoryEnum, HistoryOfModuleEnum } from './activitiesRecordHistory.enums';
import { Types } from 'mongoose';

export interface IactivitiesRecordHistory {
     _id?: string;
     category: ActivitiesRecordHistoryCategoryEnum;
     historyOfModule: HistoryOfModuleEnum;
     moduleDocumentId: Types.ObjectId;
     userId: Types.ObjectId;
     createdAt: Date;
     updatedAt: Date;
}

export type IactivitiesRecordHistoryFilters = {
     searchTerm?: string;
};
