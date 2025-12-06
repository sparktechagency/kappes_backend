import express from 'express';
import { activitiesRecordHistoryController } from './activitiesRecordHistory.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import validateRequest from '../../middleware/validateRequest';
import { activitiesRecordHistoryValidation } from './activitiesRecordHistory.validation';

const router = express.Router();

router.post(
     '/',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.USER, USER_ROLES.VENDOR),
     validateRequest(activitiesRecordHistoryValidation.createActivitiesRecordHistoryZodSchema),
     activitiesRecordHistoryController.createActivitiesRecordHistory,
);

router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.USER, USER_ROLES.VENDOR), activitiesRecordHistoryController.getAllActivitiesRecordHistorys);

router.get(
     '/unpaginated',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.USER, USER_ROLES.VENDOR),
     activitiesRecordHistoryController.getAllUnpaginatedActivitiesRecordHistorys,
);

router.delete(
     '/hard-delete/:id',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.USER, USER_ROLES.VENDOR),
     activitiesRecordHistoryController.hardDeleteActivitiesRecordHistory,
);

router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.USER, USER_ROLES.VENDOR), activitiesRecordHistoryController.getActivitiesRecordHistoryById);

export const activitiesRecordHistoryRoutes = router;
