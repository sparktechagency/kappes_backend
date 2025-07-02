import express from 'express';
import { USER_ROLES } from '../user/user.enums';
import { settingsController } from './settings.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { settingsSchema } from './settings.validation';

const SettingsRouter = express.Router();

SettingsRouter.put('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), settingsController.addSetting)
SettingsRouter.get('/', settingsController.getSettings)
     .get('/privacy-policy', settingsController.getPrivacyPolicy)
     .get('/aboutus', settingsController.getAboutUs)
     .get('/support', settingsController.getSupport)
     .get('/termsOfService', settingsController.getTermsOfService);


// Contact CRUD
SettingsRouter.get('/contact', settingsController.getContact);
SettingsRouter.post('/contact', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(settingsSchema.updateContactShcema), settingsController.addContact);
SettingsRouter.patch('/contact/:contactId', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(settingsSchema.updateContactShcema), settingsController.updateContact);
SettingsRouter.delete('/contact/:contactId', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), settingsController.deleteContact);

// Socials CRUD
SettingsRouter.get('/socials', settingsController.getSocials);
SettingsRouter.patch('/socials', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(settingsSchema.updateSocialsShcema), settingsController.addOrUpdateSocials);

export default SettingsRouter;
