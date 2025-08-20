import { Document, Types } from 'mongoose';



export interface ISingleContact {
     phone: string;
     email: string;
     location: string;
     _id?: Types.ObjectId | string;
}
// Define the interface for your settings
export interface ISettings extends Document {
     privacyPolicy: string;
     aboutUs: string;
     support: string;
     termsOfService: string;
     contact: ISingleContact[];
     socials: {
          whatsapp?: string;
          facebook?: string;
          instagram?: string;
     },
     shippingDetails :{
          freeShipping:{
               area:string[],
               cost:number
          },
          centralShipping:{
               area:string[],
               cost:number
          },
          countryShipping:{
               area:string[],
               cost:number
          },
          worldWideShipping:{
               cost:number
          },
          
     }
}

export interface ISocials {
     whatsapp?: string;
     facebook?: string;
     instagram?: string;
     tiktok?: string;
}

export interface IContact {
     phone: string;
     email: string;
     location: string;
     _id?: Types.ObjectId | string;
}

