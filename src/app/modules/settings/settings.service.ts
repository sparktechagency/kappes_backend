// import path from 'path';
import { ISettings, ISingleContact, ISocials } from './settings.interface';
import Settings from './settings.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IBusinessMessage } from '../business/business.enums';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { User } from '../user/user.model';
import { USER_ROLES } from '../user/user.enums';
import unlinkFile from '../../../shared/unlinkFile';

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
const getPerDayAdvertiseMentCost = async () => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return settings.perDayAdvertiseMentCost;
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

const updatePerDayAdvertiseMentCost = async (payload: { cost: number }) => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     settings.perDayAdvertiseMentCost = payload.cost;
     await settings.save();
     return settings.perDayAdvertiseMentCost;
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

const updatePrivacyPolicy = async (privacyPolicy: string) => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     settings.privacyPolicy = privacyPolicy;
     await settings.save();
     return settings.privacyPolicy;
};

const updateTermsOfService = async (termsOfService: string) => {
     const settings: any = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     settings.termsOfService = termsOfService;
     await settings.save();
     return settings.termsOfService;
};

const getAllMessagesOfSettings = async (query: Record<string, unknown>) => {
     const settings = await Settings.findOne();
     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }

     let settingsMessages = settings.messages;
     // do pagination manually
     const limit = Number(query.limit) || 10;
     const page = Number(query.page) || 1;
     const skip = (page - 1) * limit;
     settingsMessages = settingsMessages.slice(skip, skip + limit);
     const meta = {
          page,
          limit,
          total: settingsMessages.length,
     };
     return { meta, settingsMessages };
};

const sendMessageToSettings = async (message: IBusinessMessage) => {
     const settings = await Settings.findOne();
     const superAdmin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });
     // senderEmail and settings.owner.email same not possibole
     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     settings.messages.push({ ...message, createdAt: new Date() });
     await settings.save();
     // sendnotification
     await sendNotifications({
          title: `${message.senderName}`,
          receiver: superAdmin!._id,
          message: `Admin ${message.senderName} has sent a message.`,
          type: 'MESSAGE',
     });
     return settings.messages;
};

const getBannerLogo = async () => {
     const settings = await Settings.findOne();
     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     return { banner: settings.banner, logo: settings.logo };
};

const addOrUpdateBannerLogo = async (payload: { banner?: string[]; logo?: string }) => {
     const settings = await Settings.findOne();
     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }
     try {
          if (payload.banner) {
               // unlinke old links
               if (settings.banner) {
                    settings.banner.forEach((banner) => {
                         unlinkFile(banner);
                    });
               }
               settings.banner = payload.banner;
          }
          if (payload.logo) {
               // unlinke old links
               if (settings.logo) {
                    unlinkFile(settings.logo);
               }
               settings.logo = payload.logo;
          }
          await settings.save();
          return { banner: settings.banner, logo: settings.logo };
     } catch (error) {
          console.log('🚀 ~ addOrUpdateBannerLogo ~ error:', error);
     }
};
const updateIsUnderMaintenance = async (payload: { status?: boolean; endAt?: string | Date }) => {
     const settings = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }

     // Validate and convert endAt to Date if provided
     if (payload.endAt) {
          const endAtDate = new Date(payload.endAt);
          if (isNaN(endAtDate.getTime())) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid endAt date');
          }
          // endAtDate must be of future
          if (endAtDate.getTime() < Date.now()) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'endAt date must be of future');
          }
          payload.endAt = endAtDate;
     }

     // Update the settings
     if (typeof payload.status !== 'undefined') {
          settings.isUnderMaintenance.status = payload.status;
     }

     if (payload.endAt) {
          settings.isUnderMaintenance.endAt = payload.endAt as Date;
     }

     await settings.save();

     return { isUnderMaintenance: settings.isUnderMaintenance };
};

const getIsUnderMaintenance = async () => {
     const settings = await Settings.findOne();

     if (!settings) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Settings not found');
     }

     return { isUnderMaintenance: settings.isUnderMaintenance };
};

export const settingsService = {
     upsertSettings,
     getSettings,
     getPrivacyPolicy,
     // getAccountDelete,
     getSupport,
     getPerDayAdvertiseMentCost,
     updatePerDayAdvertiseMentCost,
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
     updatePrivacyPolicy,
     updateTermsOfService,
     getAllMessagesOfSettings,
     sendMessageToSettings,
     getBannerLogo,
     addOrUpdateBannerLogo,
     updateIsUnderMaintenance,
     getIsUnderMaintenance,
};
