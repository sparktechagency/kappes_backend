import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import validateRequest from '../../middleware/validateRequest';
const router = express.Router();

// product related routes
router.post(
     '/product',
     validateRequest(ReviewValidation.reviewZodSchema),
     auth(USER_ROLES.USER),
     ReviewController.createProductReview,
);

router.get(
     '/product/shop/:shopId',
     auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR),
     ReviewController.getShopProductsReviews,
);
router.get(
     '/product/:productId',
     ReviewController.getProductReviews,
);

router.delete(
     '/:reviewId',
     auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR),
     ReviewController.deleteProductReview,
);




// business related routes
// router.post(
//      '/business',
//      validateRequest(ReviewValidation.reviewZodSchema),
//      auth(USER_ROLES.USER),
//      ReviewController.createReview,
// );

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
