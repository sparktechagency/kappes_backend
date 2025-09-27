import express from 'express';
import { WalletController } from './wallet.controller';
import { USER_ROLES } from '../user/user.enums';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { WalletValidation } from './wallet.validation';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLES.USER),
  validateRequest(WalletValidation.addBalanceValidation),
  WalletController.addToWallet
);


router.get(
  '/',
  auth(USER_ROLES.USER),
  WalletController.getWallet
);

router.post(
    '/withdraw',
    auth(USER_ROLES.USER),
    validateRequest(WalletValidation.withDrawFromAvailableBalance),
    WalletController.withDrawFromAvailableBalance
);

export const WalletRoutes = router