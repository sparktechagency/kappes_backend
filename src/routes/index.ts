import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { AuthRouter } from '../app/modules/auth/auth.route';
import { CommentRouter } from '../app/modules/comments/comments.router';
import { CommunityRouter } from '../app/modules/community/community.router';
import { ContactRoutes } from '../app/modules/contcatus/contactus.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { SubCategoryRoutes } from '../app/modules/subCategorys/subCategory.route';
import { userManagementRouter } from '../app/modules/admin/userManagement/userManagement.route';
import { DashboardRoutes } from '../app/modules/admin/dashboard/dashboard.route';
import { CreatePostRoutes } from '../app/modules/admin/creaetPost/creaetPost.router';
import SettingsRouter from '../app/modules/settings/settings.route';
import { AdminRoutes } from '../app/modules/admin/admin.route';
import { NotificationRoutes } from '../app/modules/notification/notification.routes';
import { ChallengeRoutes } from '../app/modules/admin/challanges/challanges.router';
import { VariantRoutes } from '../app/modules/variant/variant.routes';
import { BrandRoutes } from '../app/modules/brand/brand.routes';
import { ShopCategoryRoutes } from '../app/modules/shopCategory/shopCategory.routes';
import { ShopRoutes } from '../app/modules/shop/shop.route';
import { ProductRoutes } from '../app/modules/product/product.route';
import { CartRoutes } from '../app/modules/cart/cart.routes';
import { CouponRoutes } from '../app/modules/coupon/coupon.route';
import { OfferedRoutes } from '../app/modules/offered/offered.route';
import stripeAccountRoutes from '../app/modules/stripeAccount/stripeAccount.route';
import { OrderRoutes } from '../app/modules/order/order.route';
import { paymentRoutes } from '../app/modules/payment/payment.route';
import { ReviewRoutes } from '../app/modules/review/review.routes';
import { WishlistRoutes } from '../app/modules/wishlist/wishlist.route';
import { BusinessRouter } from '../app/modules/business/business.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
import { ChatRoutes } from '../app/modules/chat/chat.routes';
import { MessageRoutes } from '../app/modules/message/message.routes';

const router = express.Router();
const routes = [
     {
          path: '/auth',
          route: AuthRouter,
     },
     {
          path: '/users',
          route: UserRouter,
     },
     {
          path: '/community',
          route: CommunityRouter,
     },
     {
          path: '/comments',
          route: CommentRouter,
     },
     {
          path: '/contact',
          route: ContactRoutes,
     },
     {
          path: '/admin/contact',
          route: ContactRoutes,
     },
     {
          path: '/admin/category',
          route: CategoryRoutes,
     },
     {
          path: '/admin/managment',
          route: AdminRoutes,
     },
     {
          path: '/category',
          route: CategoryRoutes,
     },
     {
          path: '/admin/subcategory',
          route: SubCategoryRoutes,
     },
     {
          path: '/subcategory',
          route: SubCategoryRoutes,
     },
     {
          path: '/admin/user/managment',
          route: userManagementRouter,
     },
     {
          path: '/admin/post/managment',
          route: CreatePostRoutes,
     },
     {
          path: '/post',
          route: CreatePostRoutes,
     },
     {
          path: '/admin/notifications',
          route: NotificationRoutes,
     },
     {
          path: '/notifications',
          route: NotificationRoutes,
     }, 
     {
          path: '/admin/challenge',
          route: ChallengeRoutes,
     },
     {
          path: '/challenge',
          route: ChallengeRoutes,
     },
     {
          path: '/admin/dashboard',
          route: DashboardRoutes,
     }, 
     {
          path: '/settings',
          route: SettingsRouter,
     },
     {
          path: '/variant',
          route: VariantRoutes,
     },
     {
          path: '/brand',
          route: BrandRoutes,
     },
     {
          path: '/shopCategory',
          route: ShopCategoryRoutes,
     },
     {
          path: '/shop',
          route: ShopRoutes,
     },
     {
          path: '/product',
          route: ProductRoutes,
     },
     {
          path: '/cart',
          route: CartRoutes,
     },
     {
          path: '/coupon',
          route: CouponRoutes,
     },
     {
          path: '/offered',
          route: OfferedRoutes,
     },
     {
          path: '/stripe',
          route: stripeAccountRoutes,
     },
     {
          path: '/order',
          route: OrderRoutes,
     },
     {
          path: '/payment',
          route: paymentRoutes,
     },
     {
          path: '/review',
          route: ReviewRoutes,
     },
     {
          path: '/wishlist',
          route: WishlistRoutes,
     },
     {
          path: '/business',
          route: BusinessRouter,
     },
     {
          path: '/faq',
          route: FaqRoutes,
     },
     {
          path: '/chat',
          route: ChatRoutes,
     },
     {
          path: '/message',
          route: MessageRoutes,
     },
];

routes.forEach((element) => {
     if (element?.path && element?.route) {
          router.use(element?.path, element?.route);
     }
});

export default router;
