import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import { FOLDER_NAMES } from '../../../enums/files';
import parseFileData from '../../middleware/parseFileData';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import validateRequest from '../../middleware/validateRequest';
import { brandValidation } from './brand.validation';
import { BrandController } from './brand.controller';

const router = Router();

router.get("/", BrandController.getAllBrand)

router.post(
    '/create',
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
    fileUploadHandler(), parseFileData(FOLDER_NAMES.LOGO),
    validateRequest(brandValidation.createBrandValidationSchema),
    BrandController.createBrand
);

router.patch(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
    fileUploadHandler(), parseFileData(FOLDER_NAMES.LOGO),
    validateRequest(brandValidation.updateBrandValidationSchema),
    BrandController.updateBrand
)

router.delete(
    '/:id',
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN),
    BrandController.deleteBrand
)

export const BrandRoutes = router;
