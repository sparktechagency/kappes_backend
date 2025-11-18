import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLES } from '../user/user.enums';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';
import express from 'express';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import { Request, Response, NextFunction } from 'express';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
const router = express.Router();

// Create product (only vendors can create products)
router.post(
     '/create',
     auth(USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
     // validateRequest(ProductValidation.createProductZodSchema),
     fileUploadHandler(),
     (req: Request, res: Response, next: NextFunction) => {
          try {
               if (req.body.data) {
                    const parsedData = JSON.parse(req.body.data);
                    // Attach image path or filename to parsed data
                    if (req.files) {
                         const image = getMultipleFilesPath(req.files, 'image');
                         parsedData.images = image;
                    }

                    // Validate and assign to req.body
                    const formattedParsedData = ProductValidation.createProductZodSchema.parse({ body: parsedData });
                    req.body = formattedParsedData.body;
               }

               // Proceed to controller
               return ProductController.createProduct(req, res, next);
          } catch (error) {
               next(error); // Pass validation errors to error handler
          }
     },
);

// Get all products (public endpoint)
router.get(
     '/',
     // validateRequest(ProductValidation.getProductsZodSchema),
     ProductController.getProducts,
);

// Get products with wishlist (public endpoint)
router.get('/get-products-with-wishlist', auth(USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ProductController.getProductsWithWishlist);

// Get products by category (public endpoint)
router.get('/category/:categoryId', ProductController.getProductsByCategory);

// get all recommended products (public endpoint)
router.get('/recommended', ProductController.getRecommendedProducts);

// recommended product (only vendor who owns the product)
router.patch('/recommended/:id', auth(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SHOP_ADMIN), ProductController.updateToggleProductIsRecommended);

// get all products by province (public endpoint)
router.get('/province/:province', ProductController.getAllProductsByProvince);
router.get('/territory/:territory', ProductController.getAllProductsByTerritory);

// get product by shop
router.get('/shop/:shopId', ProductController.getProductsByShop);

// get product by shop
// router.patch('/variant/:id',
//     validateRequest(ProductValidation.upateProductsVarinatsPriceOrQuantityZodSchema),
//     ProductController.updateProductsVarinatsPriceOrQuantity
// );

// Delete product (only vendor who owns the product)
router.delete('/:id', auth(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(ProductValidation.deleteProductZodSchema), ProductController.deleteProduct);

// Update product if 'payload.product_variant_Details' is provided must be include all old varinat info otherwise it will be replaced
router.patch('/:id', auth(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandler(), (req: Request, res: Response, next: NextFunction) => {
     try {
          if (req.body) {
               let parsedData;
               if (req.body.data) {
                    parsedData = JSON.parse(req.body.data);
               } else {
                    parsedData = req.body;
               }
               // Attach image path or filename to parsed data
               if (req.files) {
                    const image = getMultipleFilesPath(req.files, 'image');
                    parsedData.images = image;
               }

               // Validate and assign to req.body
               const formattedParsedData = ProductValidation.updateProductZodSchema.parse({ body: parsedData });
               req.body = formattedParsedData.body;
          }

          // Proceed to controller
          return ProductController.updateProduct(req, res, next);
     } catch (error) {
          next(error); // Pass validation errors to error handler
     }
});

// Get product by ID (public endpoint)
// router.patch('/:id',
//     auth(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SHOP_ADMIN),
//     validateRequest(productVariantByFieldNameSchema),
//     ProductController.addNewVariantToProductByVariantFieldName
// );
// router.patch('/:id',
//     auth(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SHOP_ADMIN),
//     validateRequest(productVariantByFieldNameSchema),
//     ProductController.updateProductVariantByVariantFieldName
// );
// router.delete('/:id',
//     auth(USER_ROLES.VENDOR, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.SHOP_ADMIN),
//     ProductController.deleteProductVariantByVariantFieldName
// );

// Get product by ID (public endpoint)
router.get('/:id', ProductController.getProductById);
export const ProductRoutes = router;
