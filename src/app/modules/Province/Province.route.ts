import express from 'express';
import { ProvinceController } from './Province.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import { FOLDER_NAMES } from '../../../enums/files';
import validateRequest from '../../middleware/validateRequest';
import { ProvinceValidation } from './Province.validation';
import parseMultipleFilesdata from '../../middleware/parseMultipleFilesdata';

const router = express.Router();

router.post(
     '/',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     fileUploadHandler(),
     parseMultipleFilesdata(FOLDER_NAMES.IMAGE),
     validateRequest(ProvinceValidation.createProvinceZodSchema),
     ProvinceController.createProvince,
);

router.get('/', ProvinceController.getAllProvinces);

router.get('/unpaginated', ProvinceController.getAllUnpaginatedProvinces);

router.delete('/hard-delete/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ProvinceController.hardDeleteProvince);

router.patch(
     '/:id',
     fileUploadHandler(),
     parseMultipleFilesdata(FOLDER_NAMES.IMAGE),
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     validateRequest(ProvinceValidation.updateProvinceZodSchema),
     ProvinceController.updateProvince,
);

router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ProvinceController.deleteProvince);

router.get('/:id', ProvinceController.getProvinceById);

export const ProvinceRoutes = router;
