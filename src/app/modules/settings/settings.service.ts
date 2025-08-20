// import path from 'path';
import { ISettings, ISingleContact, ISocials } from './settings.interface';
import Settings from './settings.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';

const upsertSettings = async (data: Partial<ISettings>): Promise<ISettings> => {
     const existingSettings = await Settings.findOne({});
     if (existingSettings) {
          const updatedSettings = await Settings.findOneAndUpdate({}, data, {
               new: true,
          });
          return updatedSettings!;
     } else {
          const newSettings = await Settings.create(data);
          if (!newSettings) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to add settings');
          }
          return newSettings;
     }
};
const getSettings = async (title: string) => {
     const settings: any = await Settings.findOne().select(title);
     if (title && settings[title]) {
          return settings[title];
     }
     return settings;
};

const getTermsOfService = async () => {
     const settings: any = await Settings.findOne();
     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.termsOfService;
};
const getSupport = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.support;
};
const getPrivacyPolicy = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.privacyPolicy;
};
const getAboutUs = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.aboutUs;
};

// const getPrivacyPolicy = async () => {
//   return path.join(__dirname, '..', 'htmlResponse', 'privacyPolicy.html');
// };

// const getAccountDelete = async () => {
//      return path.join(__dirname, '..', 'htmlResponse', 'accountDelete.html');
// };

// const getSupport = async () => {
//   return path.join(__dirname, '..', 'htmlResponse', 'support.html');
// };

const getContact = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.contact;
};

const addContact = async (contact: ISingleContact) => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     settings.contact.push(contact);
     await settings.save();
     return settings.contact;
};

const updateContact = async (contactId: string, contact: ISingleContact) => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     const updatedContact = await settings.contact.id(contactId).set(contact);
     await settings.save();
     return updatedContact;
};

const deleteContact = async (contactId: string) => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     const deletedContact = await settings.contact.id(contactId).deleteOne();
     await settings.save();
     return deletedContact;
};

const getSocials = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.socials;
};

const addOrUpdateSocials = async (socials: ISocials) => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     settings.socials = socials;
     await settings.save();
     return settings.socials;
};

const getShippingDetails = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.shippingDetails;
};

const addOrUpdateShippingDetails = async (shippingDetails: any) => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     const updatedSettings = await Settings.findOneAndUpdate({ _id: settings._id }, { shippingDetails }, { new: true });
     return updatedSettings?.shippingDetails;     
};

export const settingsService = {
     upsertSettings,
     getSettings,
     getPrivacyPolicy,
     // getAccountDelete,
     getSupport,
     getTermsOfService,
     getAboutUs,
     getContact,
     addContact,
     updateContact,
     deleteContact,
     getSocials,
     addOrUpdateSocials,
     getShippingDetails,
     addOrUpdateShippingDetails,
};
