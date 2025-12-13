import { z } from 'zod';
import { ActivitiesRecordHistoryCategoryEnum, HistoryOfModuleEnum } from './activitiesRecordHistory.enums';

const createActivitiesRecordHistoryZodSchema = z.object({
     body: z.object({
          category: z.nativeEnum(ActivitiesRecordHistoryCategoryEnum),
          historyOfModule: z.nativeEnum(HistoryOfModuleEnum),
          moduleDocumentId: z.string(),
     }),
});

export const activitiesRecordHistoryValidation = {
     createActivitiesRecordHistoryZodSchema,
};
