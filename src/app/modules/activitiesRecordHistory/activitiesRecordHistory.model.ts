import { Schema, model } from 'mongoose';
import { IactivitiesRecordHistory } from './activitiesRecordHistory.interface';

const ActivitiesRecordHistorySchema = new Schema<IactivitiesRecordHistory>({
     image: { type: String, required: true },
     title: { type: String,required: true },
     description: { type: String,required: true },
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

ActivitiesRecordHistorySchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

ActivitiesRecordHistorySchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

ActivitiesRecordHistorySchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});       

export const ActivitiesRecordHistory = model<IactivitiesRecordHistory>('ActivitiesRecordHistory', ActivitiesRecordHistorySchema);
