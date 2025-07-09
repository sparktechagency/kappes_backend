import express from 'express';
import { VariantFieldController } from './variantField.controller';
import { USER_ROLES } from '../user/user.enums';
import auth from '../../middleware/auth';

const router = express.Router();

// Get all variant fields
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), 
  VariantFieldController.getVariantField
);

// Get paginated items for a specific field
router.get(
  '/:fieldName',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  VariantFieldController.getFieldItems
);

// Get a specific item from a field by ID
router.get(
  '/:fieldName/item',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  VariantFieldController.getFieldItemById
);

// Add a new item to a field
router.post(
  '/:fieldName',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  VariantFieldController.addFieldItem
);

// Update an existing item in a field
router.patch(
  '/:fieldName/item',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  VariantFieldController.updateFieldItem
);

// Delete an item from a field
router.delete(
  '/:fieldName/item',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  VariantFieldController.deleteFieldItem
);

export const VariantFieldRoutes = router;
