import express from "express";
import auth from "../../middleware/auth";
import { USER_ROLES } from "../user/user.enums";
import validateRequest from "../../middleware/validateRequest";
import { variantValidation } from "./variant.validation";
import { variantController } from "./variant.controller";

const router = express.Router();

router.post("/", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(variantValidation.createVariantSchema), variantController.createVariantController); // Create a new variant
router.get("/", variantController.getAllVariants); // Create a new variant
router.get("/single/:id", variantController.getSingleVariantById); // Create a new variant
router.get("/subcategory/:id", variantController.getVariantsBySubCategoryId); // Create a new variant
router.get("/variant-subcategory/:id", variantController.getVariantFieldsBySubCategoryId); // Create a new variant
router.get("/slug/:slug", variantController.getSingleVariantBySlug); // Create a new variant
router.patch("/:id", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(variantValidation.updateVariantSchema), variantController.updateVariantController); // Update variant
router.delete("/:id", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),variantController.deleteVariantController); // Delete variant

export const VariantRoutes = router;
