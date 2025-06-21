import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../user/user.enums';
import { ReviewController } from './review.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validation';
const router = express.Router();

router.post(
     '/',
     auth(USER_ROLES.USER),
     validateRequest(ReviewValidation.reviewZodSchema),
     async (req: Request, res: Response, next: NextFunction) => {
          try {
               const { rating, ...othersData } = req.body;

               req.body = {
                    ...othersData,
                    customer: req.user.id,
                    rating: Number(rating),
               };
               next();
          } catch (error) {
               console.log(error);
               return res.status(500).json({ message: 'Failed to convert string to number' });
          }
     },
     auth(USER_ROLES.USER),
     ReviewController.createReview,
);

// // shop related routes
// // Get reviews by shop
// router.get('/reviews/:shopId', ReviewController.getReviewsByShop);
// const getReviewsByShop = catchAsync(async (req: Request, res: Response) => {
//     const { shopId } = req.params;
//     const result = await ReviewService.getReviewsByShop(shopId);
//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: 'Reviews by shop retrieved successfully',
//         data: result,
//     });
// });


export const ReviewRoutes = router;
