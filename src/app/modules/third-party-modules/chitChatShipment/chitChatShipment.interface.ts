import {
     chitChatShipment_order_store,
     chitChatShipment_package_contents,
     chitChatShipment_package_type,
     chitChatShipment_postage_type,
     chitChatShipment_size_unit,
     chitChatShipment_value_currency,
     chitChatShipment_weight_unit,
} from './chitChatShipment.enum';

export interface IchitChatShipment {
     name: string;
     address_1: string;
     address_2?: string;
     city: string;
     province_code?: string;
     postal_code?: string;
     country_code: string;
     phone?: string;
     email?: string;
     return_name?: string;
     return_address_1?: string;
     return_address_2?: string;
     return_city?: string;
     return_province_code?: string;
     return_phone?: string;
     package_contents?: chitChatShipment_package_contents;
     description?: string;
     value: string;
     value_currency: chitChatShipment_value_currency;
     order_id?: string;
     order_store?: chitChatShipment_order_store;
     package_type: chitChatShipment_package_type;
     weight_unit: chitChatShipment_weight_unit;
     weight: number;
     size_unit: chitChatShipment_size_unit;
     size_x: number;
     size_y: number;
     size_z: number;
     insurance_requested?: boolean;
     signature_requested?: boolean;
     vat_reference?: string;
     duties_paid_requested?: boolean;
     postage_type?: chitChatShipment_postage_type;
     cheapest_postage_type_requested?: string;
     tracking_number?: string;
     ship_date?: string;
     line_items?: {
          quantity: number;
          description: string;
          value_amount: string;
          currency_code: string;
          hs_tariff_code: string;
          sku_code: string;
          origin_country: string;
          weight: number;
          weight_unit: string;
     }[];
     isDeleted: boolean;
     deletedAt: Date;
}

export type IchitChatShipmentFilters = {
     searchTerm?: string;
};
