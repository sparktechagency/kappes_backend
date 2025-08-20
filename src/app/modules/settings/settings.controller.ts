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

export const settingsController = {
     getSettings,
     getPrivacyPolicy,
     getAboutUs,
     getSupport,
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
};
