import { Schema, model } from 'mongoose';
import { IactivitiesRecordHistory } from './activitiesRecordHistory.interface';
import { ActivitiesRecordHistoryCategoryEnum, HistoryOfModuleEnum } from './activitiesRecordHistory.enums';

const ActivitiesRecordHistorySchema = new Schema<IactivitiesRecordHistory>(
     {
          category: { type: String, enum: ActivitiesRecordHistoryCategoryEnum, required: true },
          historyOfModule: { type: String, enum: HistoryOfModuleEnum, required: true },
          moduleDocumentId: { type: Schema.Types.ObjectId, refPath: 'historyOfModule', required: true },
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
     },
     { timestamps: true },
);

export const ActivitiesRecordHistory = model<IactivitiesRecordHistory>('ActivitiesRecordHistory', ActivitiesRecordHistorySchema);
