import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import { BusinessValidation } from './business.validation';
import { BusinessController } from './business.controller';
import { USER_ROLES } from '../user/user.enums';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseMulitpleFieldsData from '../../middleware/parseMulitpleFieldsData';
import { FOLDER_NAMES } from '../../../enums/files';

const router = express.Router();

router.route('/create').post(auth(USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN,USER_ROLES.USER), fileUploadHandler(), parseMulitpleFieldsData(FOLDER_NAMES.LOGO, FOLDER_NAMES.BANNER, FOLDER_NAMES.COVER_PHOTO), validateRequest(BusinessValidation.createBusinessZodSchema), BusinessController.createBusiness);

router.route('/update/:id').patch(auth(USER_ROLES.VENDOR, USER_ROLES.SHOP_ADMIN,USER_ROLES.USER), fileUploadHandler(), parseMulitpleFieldsData(FOLDER_NAMES.LOGO, FOLDER_NAMES.BANNER, FOLDER_NAMES.COVER_PHOTO), validateRequest(BusinessValidation.updateBusinessZodSchema), BusinessController.updateBusiness);

router.post('/resend-otp',validateRequest(BusinessValidation.createResendOtpZodSchema), BusinessController.resendOtp);

router.post('/verify-email', validateRequest(BusinessValidation.createVerifyEmailZodSchema), BusinessController.verifyEmail);

// get all verified businesses
router.get('/all', BusinessController.getAllVerifiedBusinesses);

// get all businesses of user
router.get('/my-businesses', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.VENDOR), BusinessController.getAllBusinessesOfUser);

// get all messages of business by business id
router.get('/messages/:id', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.VENDOR), BusinessController.getAllMessagesOfBusiness);

// send message to business
router.post('/message/:id', validateRequest(BusinessValidation.createMessageZodSchema), BusinessController.sendMessageToBusiness);

// get business details by business id
router.get('/:id', BusinessController.getBusinessDetails);

// delete business
router.delete('/:id', auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.VENDOR), BusinessController.deleteBusiness);


export const BusinessRouter = router;
