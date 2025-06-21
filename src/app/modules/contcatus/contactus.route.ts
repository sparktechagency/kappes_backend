import { Router } from 'express';
import { USER_ROLES } from '../user/user.enums';
import auth from '../../middleware/auth';
import { ContactController } from './contactus.controller';

const router = Router();

router.post('/create-contact', auth(USER_ROLES.USER), ContactController.createContact); // mailing handler fix korte hobe jate target er email e jaye ekhon to soobai passe
router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ContactController.getAllContacts);
// router.get('/website/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ContactController.getContactcOfWebsite); // filter by refferenceId is empty
// router.get('/shop/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ContactController.getContactcOfShopById);
// router.get('/business/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ContactController.getContactcOfBusinessById);
router.get('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ContactController.getsingleContact);

export const ContactRoutes = router;
