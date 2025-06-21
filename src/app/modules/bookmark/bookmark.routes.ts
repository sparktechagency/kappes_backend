import express from 'express';
import { BookmarkController } from './bookmark.controller';
import { USER_ROLES } from '../user/user.enums';
import auth from '../../middleware/auth';

const router = express.Router();

router.get('/', auth(USER_ROLES.USER), BookmarkController.getBookmark);
router.post('/:id', auth(USER_ROLES.USER), BookmarkController.toggleBookmark);

export const BookmarkRoutes = router;
