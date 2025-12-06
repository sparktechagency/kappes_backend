import express from 'express';
import { activitiesRecordHistoryController } from './activitiesRecordHistory.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseFileData from '../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { activitiesRecordHistoryValidation } from './activitiesRecordHistory.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE),
    validateRequest(activitiesRecordHistoryValidation.createActivitiesRecordHistoryZodSchema), activitiesRecordHistoryController.createActivitiesRecordHistory);

router.get('/', activitiesRecordHistoryController.getAllActivitiesRecordHistorys);

router.get('/unpaginated', activitiesRecordHistoryController.getAllUnpaginatedActivitiesRecordHistorys);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), activitiesRecordHistoryController.hardDeleteActivitiesRecordHistory);

router.patch('/:id', fileUploadHandler(),
    parseFileData(FOLDER_NAMES.IMAGE), auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(activitiesRecordHistoryValidation.updateActivitiesRecordHistoryZodSchema), activitiesRecordHistoryController.updateActivitiesRecordHistory);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), activitiesRecordHistoryController.deleteActivitiesRecordHistory);

router.get('/:id', activitiesRecordHistoryController.getActivitiesRecordHistoryById);

export const activitiesRecordHistoryRoutes = router;
