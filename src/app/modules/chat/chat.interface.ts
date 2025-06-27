import { Model, Types } from 'mongoose';

export type IChat = {
     participants: [Types.ObjectId]; // rabby use all shop id field for all chats, allow shop specific admins and owner to chat with users
     status: boolean;
};

export type ChatModel = Model<IChat, Record<string, unknown>>;
