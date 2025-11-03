export enum chitChatShipment_package_type {
     card = 'Postcard',
     letter = 'Letter',
     envelope = 'Flat Envelope',
     thick_envelope = 'Thick Envelope',
     parcel = 'Parcel',
     flat_rate_envelope = 'USPS Letter Flat Rate Envelope',
     flat_rate_legal_envelope = 'USPS Legal Flat Rate Envelope',
     flat_rate_padded_envelope = 'USPS Padded Flat Rate Envelope',
     flat_rate_gift_card_envelope = 'USPS Gift Card Flat Rate Envelope',
     flat_rate_window_envelope = 'USPS Window Flat Rate Envelope',
     flat_rate_cardboard_envelope = 'USPS Cardboard Flat Rate Envelope',
     small_flat_rate_envelope = 'USPS Small Flat Rate Envelope',
     small_flat_rate_box = 'USPS Small Flat Rate Box',
     medium_flat_rate_box_1 = 'USPS Medium Flat Rate Box - 1',
     medium_flat_rate_box_2 = 'USPS Medium Flat Rate Box - 2',
     large_flat_rate_box = 'USPS Large Flat Rate Box',
}

export enum chitChatShipment_weight_unit {
     gram = 'g',
     kilogram = 'kg',
     ounce = 'oz',
     pound = 'lb',
}

export enum chitChatShipment_size_unit {
     centimeter = 'cm',
     meter = 'm',
     inch = 'in',
}

export enum chitChatShipment_package_contents {
     merchandise = 'merchandise',
     documents = 'documents',
     gift = 'gift',
     returned_goods = 'returned_goods',
     sample = 'sample',
     other = 'other',
}

export enum chitChatShipment_value_currency {
     usd = 'usd',
     cad = 'cad',
}
export enum chitChatShipment_postage_type {
     unknown = 'Use when you wish to view rates before buying postage',
     chit_chats_us_edge = 'Chit Chats U.S. Edge',
     chit_chats_us_select = 'Chit Chats U.S. Select',
     chit_chats_us_slim = 'Chit Chats U.S. Slim',
     canada_post_tracked_packet_usa = 'Canada Post Tracked Packet™ – USA',
     canada_post_expedited_parcel_usa = 'Canada Post Expedited Parcel™ – USA',
     usps_express = 'USPS Priority Mail Express®',
     usps_first = 'USPS First-Class Mail®',
     usps_ground_advantage = 'USPS Ground Advantage®',
     usps_library_mail = 'USPS Library Mail',
     usps_media_mail = 'USPS Media Mail®',
     usps_priority = 'USPS Priority Mail®',
     usps_other = 'USPS Other Mail Class',
     chit_chats_canada_tracked = 'Chit Chats Canada Tracked',
     chit_chats_select = 'Chit Chats Select',
     chit_chats_slim = 'Chit Chats Slim',
     chit_chats_international_tracked = 'Chit Chats International Tracked',
     usps_express_mail_international = 'USPS Priority Mail Express International®',
     usps_first_class_mail_international = 'USPS First-Class Mail International',
     usps_first_class_package_international_service = 'USPS First-Class Package International Service®',
     usps_priority_mail_international = 'USPS Priority Mail International®',
}

export enum chitChatShipment_order_store {
     adobe_commerce = 'adobe_commerce',
     amazon = 'amazon',
     bigcommerce = 'bigcommerce',
     ebay = 'ebay',
     etsy = 'etsy',
     shipstation = 'shipstation',
     shopify = 'shopify',
     squarespace = 'squarespace',
     woocommerce = 'woocommerce',
     other = 'other',
}
