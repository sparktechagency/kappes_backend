import mongoose from 'mongoose';
import config from '../config';
import Settings from '../app/modules/settings/settings.model';
import { logger } from '../shared/logger';

const seedDefaultSettings = async () => {
     try {
          const existingSettings = await Settings.findOne();

          if (existingSettings) {
               console.log('Default settings already exist');
               return;
          }

          const settings = {
               privacyPolicy: '',
               banner: [],
               logo: '',
               perDayAdvertiseMentCost: 0,
               isUnderMaintenance: {
                    status: false,
                    endAt: null,
               },
               aboutUs: '',
               support: '',
               termsOfService: '',
               messages: [],
               contact: [
                    {
                         phone: '08123456789',
                         email: 'info@example.com',
                         location: 'Jakarta',
                    },
               ],
               socials: {
                    whatsapp: '',
                    facebook: '',
                    instagram: '',
                    tiktok: '',
               },
               shippingDetails: {
                    freeShipping: {
                         area: [],
                         cost: 0,
                    },
                    centralShipping: {
                         area: [],
                         cost: 0,
                    },
                    countryShipping: {
                         area: [],
                         cost: 0,
                    },
                    worldWideShipping: {
                         cost: 0,
                    },
               },
          };

          await Settings.create(settings);
          console.log('Default settings created successfully');
     } catch (error) {
          logger.error('Error seeding settings:', error);
     }
};

const seedSettings = async () => {
     try {
          console.log('--------------> Settings seeding start <--------------');
          await seedDefaultSettings();
          console.log('--------------> Settings seeding completed <--------------');
     } catch (error) {
          logger.error('Settings seeding failed:', error);
     } finally {
          await mongoose.disconnect();
     }
};

// Connect DB & run
mongoose
     .connect(config.database_url as string)
     .then(seedSettings)
     .catch((err) => {
          console.error('MongoDB connection error:', err);
          mongoose.disconnect();
     });
