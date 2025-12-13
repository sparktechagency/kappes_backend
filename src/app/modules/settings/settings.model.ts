import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface';

const ContactSchema: Schema = new Schema({
     phone: { type: String, required: true },
     email: { type: String, required: true },
     location: { type: String, required: true },
});

const settingsSchema = new Schema<ISettings>(
     {
          privacyPolicy: {
               type: String,
               default: '',
          },
          banner: { type: [String], required: false },
          logo: { type: String, required: false },
          perDayAdvertiseMentCost: { type: Number, required: false },
          aboutUs: {
               type: String,
               default: '',
          },
          support: {
               type: String,
               default: '',
          },
          termsOfService: {
               type: String,
               default: '',
          },
          messages: [
               {
                    senderName: { type: String, required: true },
                    senderEmail: { type: String, required: true },
                    message: { type: String, required: true },
                    phone: { type: String, required: false },
                    createdAt: { type: Date, default: Date.now },
               },
          ],
          contact: { type: [ContactSchema], required: true },
          socials: {
               whatsapp: { type: String, required: false },
               facebook: { type: String, required: false },
               instagram: { type: String, required: false },
               tiktok: { type: String, required: false },
          },
          shippingDetails: {
               freeShipping: {
                    area: [String],
                    cost: Number,
               },
               centralShipping: {
                    area: [String],
                    cost: Number,
               },
               countryShipping: {
                    area: [String],
                    cost: Number,
               },
               worldWideShipping: {
                    cost: Number,
               },
          },
     },
     { timestamps: true },
);

// Create the model
const Settings = model<ISettings>('Settings', settingsSchema);

export default Settings;
