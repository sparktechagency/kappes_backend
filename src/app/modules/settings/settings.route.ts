import express from 'express';
import { USER_ROLES } from '../user/user.enums';
import { settingsController } from './settings.controller';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { settingsSchema } from './settings.validation';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseMultipleFilesdata from '../../middleware/parseMultipleFilesdata';
import { FOLDER_NAMES } from '../../../enums/files';
import parseFileData from '../../middleware/parseFileData';

const SettingsRouter = express.Router();

SettingsRouter.put('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), settingsController.addSetting);
SettingsRouter.get('/', settingsController.getSettings)
     .get('/privacy-policy', settingsController.getPrivacyPolicy)
     .get('/aboutus', settingsController.getAboutUs)
     .get('/support', settingsController.getSupport)
     .get('/per-day-advertise-ment-cost', settingsController.getPerDayAdvertiseMentCost)
     .get('/termsOfService', settingsController.getTermsOfService);

// // get all messages of business by business id 🏃‍♀️‍➡️
SettingsRouter.get('/message', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.VENDOR), settingsController.getAllMessagesOfSettings);

// send message to business
SettingsRouter.post('/message', validateRequest(settingsSchema.createMessageZodSchema), settingsController.sendMessageToSettings);

// patch privacy policy
SettingsRouter.patch('/privacy-policy', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), settingsController.updatePrivacyPolicy);
// patch terms of service
SettingsRouter.patch('/termsOfService', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), settingsController.updateTermsOfService);
// getPerDayAdvertiseMentCost
SettingsRouter.patch('/per-day-advertise-ment-cost', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), settingsController.updatePerDayAdvertiseMentCost);

// Contact CRUD
SettingsRouter.get('/contact', settingsController.getContact);
SettingsRouter.post('/contact', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(settingsSchema.updateContactShcema), settingsController.addContact);
SettingsRouter.patch('/contact/:contactId', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(settingsSchema.updateContactShcema), settingsController.updateContact);
SettingsRouter.delete('/contact/:contactId', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), settingsController.deleteContact);

// Socials CRUD
SettingsRouter.get('/socials', settingsController.getSocials);
SettingsRouter.patch('/socials', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), validateRequest(settingsSchema.updateSocialsShcema), settingsController.addOrUpdateSocials);

// Shipping Details CRUD
SettingsRouter.get('/shipping-details', settingsController.getShippingDetails);
SettingsRouter.patch(
     '/shipping-details',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
     // validateRequest(settingsSchema.updateShippingDetailsSchema),
     settingsController.addOrUpdateShippingDetails,
);

// Banner CRUD
SettingsRouter.get('/banner-logo', settingsController.getBannerLogo);
SettingsRouter.patch(
     '/banner-logo',
     auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
     fileUploadHandler(),
     parseFileData(FOLDER_NAMES.LOGO),
     parseMultipleFilesdata(FOLDER_NAMES.BANNER),
     validateRequest(settingsSchema.createOrUpdateBannerSchema),
     settingsController.addOrUpdateBannerLogo,
);

export default SettingsRouter;
