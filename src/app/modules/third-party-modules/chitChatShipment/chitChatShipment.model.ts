import { Schema, model } from 'mongoose';
import { IchitChatShipment } from './chitChatShipment.interface';

const ChitChatShipmentSchema = new Schema<IchitChatShipment>({
     isDeleted: { type: Boolean, default: false },
     deletedAt: { type: Date },
}, { timestamps: true });

ChitChatShipmentSchema.pre('find', function (next) {
     this.find({ isDeleted: false });
     next();
});

ChitChatShipmentSchema.pre('findOne', function (next) {
     this.findOne({ isDeleted: false });
     next();
});

ChitChatShipmentSchema.pre('aggregate', function (next) {
     this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
     next();
});       

export const ChitChatShipment = model<IchitChatShipment>('ChitChatShipment', ChitChatShipmentSchema);
