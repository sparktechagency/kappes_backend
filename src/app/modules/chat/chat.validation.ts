import { z } from "zod";
import { ChatParticipantType } from "./chat.enum";

export const ChatValidation = {
    createChatZodSchema: z.object({
        body: z.object({
            participants: z.array(z.object({
                participantId: z.string().optional(),
                participantType: z.nativeEnum(ChatParticipantType).optional(),
            })),
        }),
    }),
}