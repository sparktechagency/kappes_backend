import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { settingsService } from './settings.service';

const addSetting = catchAsync(async (req, res) => {
     const result = await settingsService.upsertSettings(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Setting added successfully',
          data: result,
     });
});

const getSettings = catchAsync(async (req, res): Promise<void> => {
     const result = await settingsService.getSettings(req.query.title as string);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Setting retrieved successfully',
          data: result,
     });
});

const getPrivacyPolicy = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.getPrivacyPolicy();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Privacy retrieved successfully',
          data: privacy,
     });
});
const getTermsOfService = catchAsync(async (req, res): Promise<void> => {
     const result = await settingsService.getTermsOfService();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'TermsOfService retrieved successfully',
          data: result,
     });
});
const getSupport = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.getSupport();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Support retrieved successfully',
          data: privacy,
     });
});
const getPerDayAdvertiseMentCost = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.getPerDayAdvertiseMentCost();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'per-day-advertisement-cost retrieved successfully',
          data: privacy,
     });
});
const getAboutUs = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.getAboutUs();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'AboutUs retrieved successfully',
          data: privacy,
     });
});

// const getAccountDelete = catchAsync(async (req, res): Promise<void> => {
//   const htmlContent = await settingsService.getAccountDelete();
//   res.sendFile(htmlContent);
// });

// const getSupport = catchAsync(async (req, res): Promise<void> => {
//   const htmlContent = await settingsService.getSupport();
//   res.sendFile(htmlContent);
// });

const getContact = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.getContact();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Contact retrieved successfully',
          data: privacy,
     });
});

const addContact = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.addContact(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Contact added successfully',
          data: privacy,
     });
});

const updatePerDayAdvertiseMentCost = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.updatePerDayAdvertiseMentCost(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'per-day-advertisement-cost added successfully',
          data: privacy,
     });
});

const updateContact = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.updateContact(req.params.contactId, req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Contact updated successfully',
          data: privacy,
     });
});

const deleteContact = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.deleteContact(req.params.contactId);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Contact deleted successfully',
          data: privacy,
     });
});

const getSocials = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.getSocials();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Socials retrieved successfully',
          data: privacy,
     });
});

const addOrUpdateSocials = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.addOrUpdateSocials(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Socials added or updated successfully',
          data: privacy,
     });
});

const getShippingDetails = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.getShippingDetails();
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Shipping Details retrieved successfully',
          data: privacy,
     });
});

const addOrUpdateShippingDetails = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.addOrUpdateShippingDetails(req.body);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Shipping Details added or updated successfully',
          data: privacy,
     });
});

const updatePrivacyPolicy = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.updatePrivacyPolicy(req.body.privacyPolicy);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Privacy Policy updated successfully',
          data: privacy,
     });
});

const updateTermsOfService = catchAsync(async (req, res): Promise<void> => {
     const privacy = await settingsService.updateTermsOfService(req.body.termsOfService);
     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Terms of Service updated successfully',
          data: privacy,
     });
});

const getAllMessagesOfSettings = catchAsync(async (req, res) => {
     const result = await settingsService.getAllMessagesOfSettings(req.query);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Messages fetched successfully',
          data: result,
     });
});

const sendMessageToSettings = catchAsync(async (req, res) => {
     const result = await settingsService.sendMessageToSettings(req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Message sent successfully',
          data: result,
     });
});

const addOrUpdateBannerLogo = catchAsync(async (req, res) => {
     const result = await settingsService.addOrUpdateBannerLogo(req.body);
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Banner Logo added or updated successfully',
          data: result,
     });
});

// get banner logo
const getBannerLogo = catchAsync(async (req, res) => {
     const result = await settingsService.getBannerLogo();
     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Banner Logo fetched successfully',
          data: result,
     });
});

const updateIsUnderMaintenance = catchAsync(async (req, res) => {
     const result = await settingsService.updateIsUnderMaintenance(req.body);

     sendResponse(res, {
          success: true,
          statusCode: StatusCodes.OK,
          message: 'Is Under Maintenance updated successfully',
          data: result,
     });
});

export const settingsController = {
     getSettings,
     getPrivacyPolicy,
     getAboutUs,
     getSupport,
     getPerDayAdvertiseMentCost,
     updatePerDayAdvertiseMentCost,
     addSetting,
     getTermsOfService,
     getContact,
     addContact,
     updateContact,
     deleteContact,
     getSocials,
     addOrUpdateSocials,
     getShippingDetails,
     addOrUpdateShippingDetails,
     updatePrivacyPolicy,
     updateTermsOfService,
     getAllMessagesOfSettings,
     sendMessageToSettings,
     addOrUpdateBannerLogo,
     getBannerLogo,
     updateIsUnderMaintenance,
};
