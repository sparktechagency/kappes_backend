import express from "express";
import auth from "../../../middleware/auth";
import { USER_ROLES } from "../../user/user.enums";
import { DashboardController } from "./dashboard.controller";
import { UserRouter } from "../../user/user.route";

// Create a new Express Router instance
const router = express.Router();
router.use("/user",auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),UserRouter)
// Route to get all the info required for the overview page
router.get("/overview", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getOverview);

// Get yearly order statistics
// Query param: year (optional) - If not provided, current year will be used
// Returns: Monthly breakdown of orders and revenue for the specified year
router.get("/orders/yearly-stats", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getOrderStats);

// Get yearly revenue statistics
// Query param: year (optional) - If not provided, current year will be used
// Returns: Monthly breakdown of revenue and order metrics for the specified year
router.get("/revenue/yearly-stats", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getRevenueStats);


// Vendor Management
router.get("/vendors", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getVendorList);
router.get("/vendors/stats", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getVendorStats);
router.patch("/vendors/status/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.toggleVendorStatus);
// router.patch("/vendors/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(updateVendorSchema), DashboardController.updateVendor);
router.delete("/vendors/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.deleteVendor);

// Store Info & Product Management
router.get("/stores/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getStoreDetails);
router.get("/stores/stats/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getStoreStats);
router.get("/stores/products/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getStoreProducts);

// Product CRUD (Admin can manage products for stores)
// router.post("/products", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(createProductSchema), DashboardController.createProduct);
// router.patch("/products/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(updateProductSchema), DashboardController.updateProduct);
router.delete("/products/:id", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.deleteProduct);

export const DashboardRoutes = router;
