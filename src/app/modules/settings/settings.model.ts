import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface';


const ContactSchema: Schema = new Schema({
     phone: { type: String, required: true },
     email: { type: String, required: true },
     location: { type: String, required: true }
});

const settingsSchema = new Schema<ISettings>(
     {
          privacyPolicy: {
               type: String,
               default: '',
          },
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
          contact: { type: [ContactSchema], required: true },
          socials: {
               whatsapp: { type: String, required: false },
               facebook: { type: String, required: false },
               instagram: { type: String, required: false },
               tiktok: { type: String, required: false },
          },
     },
     { timestamps: true },
);

// Create the model
const Settings = model<ISettings>('Settings', settingsSchema);

export default Settings;
