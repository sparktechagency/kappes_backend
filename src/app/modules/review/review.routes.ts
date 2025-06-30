import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../user/user.enums';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import validateRequest from '../../middleware/validateRequest';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
const router = express.Router();

// product related routes
router.post(
     '/product',
     auth(USER_ROLES.USER),
     fileUploadHandler(), (req: Request, res: Response, next: NextFunction) => {
          try {
               if (req.body.data) {
                    const parsedData = JSON.parse(req.body.data);
                    // Attach image path or filename to parsed data
                    if (req.files) {
                         let image = getMultipleFilesPath(req.files, 'image');
                         parsedData.images = image;
                    }
                    
                    
                    // Validate and assign to req.body
                    let formattedParsedData = ReviewValidation.reviewZodSchema.parse({ body: parsedData });
                    req.body = formattedParsedData.body;
               }

               // Proceed to controller
               return ReviewController.createProductReview(req, res, next);

          } catch (error) {
               next(error); // Pass validation errors to error handler
          }
     },
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
     '/product/:reviewId',
     auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR),
     ReviewController.deleteProductReview,
);




// business related routes
router.post(
     '/business',
     validateRequest(ReviewValidation.reviewZodSchema),
     auth(USER_ROLES.USER),
     ReviewController.createBusinessReview,
);



// toggle approved business review
router.patch(
     '/business/:reviewId',
     auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR, USER_ROLES.USER),
     ReviewController.toggleApprovedBusinessReviewByOwner,
);

// get all unapproved business reviews
router.get(
     '/business/owner',
     auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR, USER_ROLES.USER),
     ReviewController.getAllBusinessReviewsByOwner,
);

router.get(
     '/business/:businessId',
     ReviewController.getApprovedBusinessReviews,
);

router.delete(
     '/business/:reviewId',
     auth(USER_ROLES.SHOP_ADMIN, USER_ROLES.VENDOR, USER_ROLES.USER),
     ReviewController.deleteBusinessReviewByOwner,
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
