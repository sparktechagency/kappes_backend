import { Model, Types } from 'mongoose';

export interface IChat {
     participants: { participantId: Types.ObjectId; participantType: string }[]; // rabby use all shop id field for all chats, allow shop specific admins and owner to chat with users
     status: boolean;
};

export interface ChatModel extends Model<IChat, Record<string, unknown>> {};
