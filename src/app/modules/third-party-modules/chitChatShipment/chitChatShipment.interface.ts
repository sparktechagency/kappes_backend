interface IChitChats_Address {
     address_1: string;
     city: string;
     province_code: string;
     postal_code: string;
     country_code: string;
     phone: string;
}

interface IChitChats_Manufacturer {
     manufacturer_contact: string;
     manufacturer_street: string;
     manufacturer_street_2?: string;
     manufacturer_city: string;
     manufacturer_postal_code: string;
     manufacturer_province_code: string;
}

interface IChitChats_Product extends IChitChats_Manufacturer {
     quantity: number;
     description: string;
     value_amount: string;
     currency_code: string;
     hs_tariff_code: string;
     origin_country: string;
     weight: number;
     weight_unit: string;
}

interface IChitChats_Order extends IChitChats_Address {
     package_type: string;
     weight_unit: string;
     weight: number;
     size_unit: string;
     size_x: number;
     size_y: number;
     size_z: number;
     cheapest_postage_type_requested: string;
}

export interface IChitChats_CreateShipmentBody extends IChitChats_Order {
     shopId?: string;
     ship_date: string;
     line_items: IChitChats_Product[];
}

/* *************************** */

// import {
//      chitChatShipment_order_store,
//      chitChatShipment_package_contents,
//      chitChatShipment_package_type,
//      chitChatShipment_postage_type,
//      chitChatShipment_size_unit,
//      chitChatShipment_value_currency,
//      chitChatShipment_weight_unit,
// } from './chitChatShipment.enum';

// // Base address interface
// export interface IAddress {
//      name: string;
//      company?: string;
//      address_1: string;
//      address_2?: string;
//      city: string;
//      province_code?: string;
//      postal_code: string;
//      country_code: string;
//      phone?: string;
//      email?: string;
// }

// // Package item interface
// export interface IPackageItem {
//      description: string;
//      quantity: number;
//      value_amount: string;
//      value_currency: chitChatShipment_value_currency;
//      weight: number;
//      weight_unit: chitChatShipment_weight_unit;
//      sku?: string;
//      hs_code?: string;
//      origin_country_code?: string;
// }

// // Customs information interface
// export interface ICustomsInfo {
//      contents_type: chitChatShipment_package_contents;
//      contents_explanation?: string;
//      restriction_type?: string;
//      restriction_comments?: string;
//      non_delivery_option?: string;
//      customs_certify?: boolean;
//      customs_signer?: string;
//      eel_pfc?: string;
//      declaration?: string;
// }

// // Shipment options interface
// export interface IShipmentOptions {
//      insurance_amount?: string;
//      insurance_currency?: string;
//      signature_confirmation?: boolean;
//      saturday_delivery?: boolean;
//      is_return?: boolean;
//      return_service_type?: string;
//      bill_third_party_account?: string;
//      bill_third_party_country_code?: string;
//      bill_third_party_postal_code?: string;
//      bill_third_party_vat_number?: string;
//      cod_amount?: string;
//      cod_currency?: string;
//      cod_payment_method?: string;
//      cod_receipt?: boolean;
//      dry_ice_weight?: number;
//      dry_ice_weight_unit?: chitChatShipment_weight_unit;
//      fedex_hold_at_location?: boolean;
//      fedex_home_delivery?: boolean;
//      fedex_home_delivery_date?: string;
//      fedex_home_delivery_type?: string;
//      fedex_smartpost_hub?: string;
//      fedex_smartpost_indicia?: string;
//      usps_endorsement?: string;
//      usps_machinable?: boolean;
//      usps_registered_mail?: boolean;
//      usps_registered_mail_amount?: string;
//      usps_return_receipt?: boolean;
// }

// // Main shipment interface
// export interface IChitChatShipment {
//      // Sender information (required)
//      name: string;
//      company?: string;
//      address_1: string;
//      address_2?: string;
//      city: string;
//      province_code?: string;
//      postal_code: string;
//      country_code: string;
//      phone?: string;
//      email?: string;
//      description?: string;
//      value: string;
//      value_currency?: chitChatShipment_value_currency;
//      size_x: number;
//      size_y: number;
//      size_z: number;
//      insurance_requested?: boolean;
//      signature_requested?: boolean;
//      vat_reference?: string;
//      cheapest_postage_type_requested?: string;
//      tracking_number?: string;
//      ship_date?: string;
//      line_items: {
//           quantity: number;
//           description: string;
//           value_amount: string;
//           currency_code: string;
//           hs_tariff_code: string;
//           sku_code: string;
//           origin_country: string;
//           weight: number;
//           weight_unit: string;
//      }[];
//      isDeleted: boolean;
//      deletedAt: Date;
//      // Package details (required)
//      package_type: chitChatShipment_package_type;
//      package_contents: chitChatShipment_package_contents;
//      weight: number;
//      weight_unit: chitChatShipment_weight_unit;

//      // Package dimensions (optional)
//      length?: number;
//      width?: number;
//      height?: number;
//      size_unit?: chitChatShipment_size_unit;

//      // Shipping options (required)
//      postage_type: chitChatShipment_postage_type;
//      shipping_label_file_type?: 'PDF' | 'PNG' | 'ZPL';

//      // Order information (optional)
//      order_store?: chitChatShipment_order_store;
//      order_id?: string;
//      order_number?: string;
//      reference_1?: string;
//      reference_2?: string;

//      // Customs information (required for international shipments)
//      customs_info?: ICustomsInfo;

//      // Package items (optional)
//      items?: IPackageItem[];

//      // Additional options (optional)
//      options?: IShipmentOptions;

//      // Insurance (optional)
//      insurance_amount?: string;
//      insurance_currency?: string;

//      // Duties and taxes (optional)
//      duties_paid_requested?: boolean;
//      duties_paid_account_number?: string;
//      duties_paid_country_code?: string;
//      duties_paid_postal_code?: string;
//      duties_paid_vat_number?: string;

//      // Return address (optional)
//      return_name?: string;
//      return_company?: string;
//      return_address_1?: string;
//      return_address_2?: string;
//      return_city?: string;
//      return_province_code?: string;
//      return_postal_code?: string;
//      return_country_code?: string;
//      return_phone?: string;
//      return_email?: string;
// }

// // Shipment status response interface
// export interface IShipmentStatus {
//      id: string;
//      status: 'purchased' | 'cancelled' | 'voided' | 'delivered' | 'in_transit' | 'error';
//      tracking_number?: string;
//      tracking_url?: string;
//      label_url?: string;
//      created_at: string;
//      updated_at: string;
// }

// // Shipment buy response interface
// export interface IShipmentBuyResponse {
//      id: string;
//      status: string;
//      tracking_number?: string;
//      tracking_url?: string;
//      label_url?: string;
//      postage_cost: {
//           amount: string;
//           currency: string;
//      };
//      insurance_cost?: {
//           amount: string;
//           currency: string;
//      };
//      total_cost: {
//           amount: string;
//           currency: string;
//      };
//      created_at: string;
//      updated_at: string;
// }

// // Shipment tracking information
// export interface ITrackingInfo {
//      status: string;
//      status_detail?: string;
//      status_date: string;
//      location?: {
//           city?: string;
//           state?: string;
//           country?: string;
//           postal_code?: string;
//      };
//      description?: string;
// }

// // Shipment tracking response
// export interface ITrackingResponse {
//      tracking_number: string;
//      status: string;
//      service: string;
//      estimated_delivery_date?: string;
//      ship_date?: string;
//      tracking_history: ITrackingInfo[];
// }

// // Shipment label response
// export interface ILabelResponse {
//      label_url: string;
//      label_file_type: 'PDF' | 'PNG' | 'ZPL';
//      label_size: '4x6' | '4x8' | 'A4' | 'A5' | 'A6';
//      label_resolution: number;
// }

// Shipment list filters
export interface IShipmentFilters {
     status?: string;
     order_id?: string;
     order_number?: string;
     tracking_number?: string;
     created_at_min?: string;
     created_at_max?: string;
     updated_at_min?: string;
     updated_at_max?: string;
     limit?: number;
     page?: number;
     offset?: number;
}

// // Shipment list response
// export interface IShipmentListResponse {
//      shipments: IShipmentStatus[];
//      total: number;
//      limit: number;
//      offset: number;
// }

// // Shipment cancel response
// export interface ICancelShipmentResponse {
//      id: string;
//      status: 'cancelled' | 'error';
//      message?: string;
// }

// // Shipment print response
// export interface IPrintShipmentResponse {
//      id: string;
//      status: 'printed' | 'error';
//      message?: string;
//      print_url?: string;
// }

// // Shipment update request
// export type IUpdateShipmentRequest = Partial<Omit<IChitChatShipment, 'id' | 'created_at' | 'updated_at'>>;
