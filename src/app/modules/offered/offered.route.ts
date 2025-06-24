import { Router } from 'express';
import { OfferedController } from './offered.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import validateRequest from '../../middleware/validateRequest';
import { OfferedValidation } from './offered.validation';

const router = Router();

router.get('/', OfferedController.getActiveOfferedService)

router.post(
    '/',
    auth(USER_ROLES.VENDOR),
    validateRequest(OfferedValidation.createOfferSchema),
    OfferedController.createOffered
)

export const OfferedRoutes = router;
