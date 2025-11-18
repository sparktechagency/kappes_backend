import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from './user.enums';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { getSingleFilePath } from '../../../shared/getFilePath';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import validateRequest from '../../middleware/validateRequest';
const router = express.Router();

router
     .route('/profile')
     .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR), UserController.getUserProfile)
     .patch(
          auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR),
          fileUploadHandler(),
          (req: Request, res: Response, next: NextFunction) => {
               const image = getSingleFilePath(req.files, 'image');
               const data = JSON.parse(req.body.data);
               req.body = { image, ...data };
               next();
          },
          validateRequest(UserValidation.updateUserZodSchema),
          UserController.updateProfile,
     );
router.route('/admin/:id').patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(UserValidation.updateUserByIdZodSchema), UserController.updateUserById);

router.route('/').post(validateRequest(UserValidation.createUserZodSchema), UserController.createUser);
router.route('/seller').post(validateRequest(UserValidation.createUserZodSchema), UserController.createSellerUser);
router.delete('/delete', auth(USER_ROLES.USER), UserController.deleteProfile);
router.get('/get-all', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.getAllRoleBasedUser);
router.get('/get-all-vendors', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.getAllVendors);
router.get('/get-all-admins', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.getAllAdmins);


// makeadmin, user to shop admin
router.post('/make-admin', auth(USER_ROLES.SUPER_ADMIN), validateRequest(UserValidation.makeAdminZodSchema), UserController.makeAdmin);
router.delete('/delete-user/:userId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.deleteUserByAdmin);

// Admin management routes
router.get('/admin/all-users', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.getAllUsers);
router.patch(
     '/admin/:id',
     auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     validateRequest(UserValidation.updateUserByIdZodSchema),
     UserController.editAdmin
);

router.get('/admin/single-user/:userId', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), UserController.getUserAdminById);
router.delete(
     '/admin/:id',
     auth(USER_ROLES.SUPER_ADMIN),
     UserController.deleteAdmin
);


export const UserRouter = router;
