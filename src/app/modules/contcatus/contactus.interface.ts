import { Schema } from "mongoose";
import { IShop } from "../shop/shop.interface";
import { IBusiness } from "../business/business.interface";

export enum CONTACT_TYPE {
    WEBSITE = "Website",
    SHOP = "Shop",    
    BUSINESS = "Business"
}

export type TContact = {
     name: string;
     email: string;
     subject: string;
     message: string;
     refferenceId?: Schema.Types.ObjectId; // either product or business
     contact_type?: CONTACT_TYPE; // New field: Specifies which model refferenceId points to
     target?: IShop | IBusiness | any; // When populated, this will hold the actual product or business object
};
