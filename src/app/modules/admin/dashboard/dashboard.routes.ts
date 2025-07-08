import express from "express";
import auth from "../../../middleware/auth";
import { USER_ROLES } from "../../user/user.enums";
import { DashboardController } from "./dashboard.controller";
// Create a new Express Router instance
const router = express.Router();

// Route to get all the info required for the overview page
router.get("/overview", auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), DashboardController.getOverview);

export const DashboardRoutes = router;
