import { model, Schema } from 'mongoose';
import { ChatModel, IChat } from './chat.interface';
import { ChatParticipantType } from './chat.enum';

// const chatSchema = new Schema<IChat, ChatModel>({
//      participants: [
//           {
//                type: Schema.Types.ObjectId,
//                ref: 'User',
//           },
//      ],
//      status: {
//           type: Boolean,
//           default: true,
//      },
// });

// export const Chat = model<IChat, ChatModel>('Chat', chatSchema);







const participantSchema = new Schema({
  participantId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'participants.participantType', // This tells Mongoose to look at participantType for the ref
  },
  participantType: {
    type: String,
    required: true,
    enum: ChatParticipantType, // The possible models this can refer to
  },
});

const chatSchema = new Schema<IChat, ChatModel>({
  participants: [participantSchema],
  status: {
    type: Boolean,
    default: true,
  },
});

export const Chat = model<IChat, ChatModel>('Chat', chatSchema);


// {
//   "participants": [
//     {
//       "participantId": "60f1a5c2c25e4e001f86d12a",
//       "participantType": "User"
//     },
//     {
//       "participantId": "60f1a5c2c25e4e001f86d13b",
//       "participantType": "Shop"
//     }
//   ],
//   "status": true
// }




