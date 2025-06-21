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
     .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), UserController.getUserProfile)
     .patch(
          auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
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

router.route('/').post(validateRequest(UserValidation.createUserZodSchema), UserController.createUser);
router.delete('/delete', auth(USER_ROLES.USER), UserController.deleteProfile);

// make user admin, user to shop admin, user to vendor
// router.patch('/make-admin/:userId', auth(USER_ROLES.SUPER_ADMIN), UserController.makeAdmin);
// router.patch('/make-shop-admin/:userId', auth(USER_ROLES.SUPER_ADMIN), UserController.makeShopAdmin);

// // shop related routes
// // Get followed shops by user
// router.get('/shop/:userId', UserController.getShopsByFollower);

// const getShopsByFollower = catchAsync(async (req: Request, res: Response) => {
//     const { followerId } = req.params;
//     const result = await UserService.getShopsByFollower(followerId);
//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: 'Shops by follower retrieved successfully',
//         data: result,
//     });
// });

export const UserRouter = router;
