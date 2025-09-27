import express from 'express';
import { PackageController } from './package.controller';
import { PackageValidation } from './package.validation';
import { USER_ROLES } from '../user/user.enums';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';

const router = express.Router();
router.post('/create', auth(USER_ROLES.ADMIN), validateRequest(PackageValidation.createPackageZodSchema), PackageController.createPackage);
router.get('/', PackageController.getAllPackages);
router.get('/:id', PackageController.getPackageById);
router.patch('/:id', auth(USER_ROLES.ADMIN), validateRequest(PackageValidation.updatePackageZodSchema), PackageController.updatePackage);
router.delete('/:id', auth(USER_ROLES.ADMIN), PackageController.deletePackage);

export const PackageRoutes = router;
