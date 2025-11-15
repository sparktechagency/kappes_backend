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

export const DashboardRoutes = router;
