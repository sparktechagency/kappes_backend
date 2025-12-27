export enum chitChatShipment_package_type {
     card = 'card',
     letter = 'letter',
     envelope = 'envelope',
     thick_envelope = 'thick_envelope',
     parcel = 'parcel',
     flat_rate_envelope = 'flat_rate_envelope',
     flat_rate_legal_envelope = 'flat_rate_legal_envelope',
     flat_rate_padded_envelope = 'flat_rate_padded_envelope',
     flat_rate_gift_card_envelope = 'flat_rate_gift_card_envelope',
     flat_rate_window_envelope = 'flat_rate_window_envelope',
     flat_rate_cardboard_envelope = 'flat_rate_cardboard_envelope',
     small_flat_rate_envelope = 'small_flat_rate_envelope',
     small_flat_rate_box = 'small_flat_rate_box',
     medium_flat_rate_box_1 = 'medium_flat_rate_box_1',
     medium_flat_rate_box_2 = 'medium_flat_rate_box_2',
     large_flat_rate_box = 'large_flat_rate_box',
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
     unknown = 'unknown',
     // unknown = 'Use when you wish to view rates before buying postage',
     chit_chats_us_edge = 'chit_chats_us_edge',
     chit_chats_us_select = 'chit_chats_us_select',
     chit_chats_us_slim = 'chit_chats_us_slim',
     canada_post_tracked_packet_usa = 'canada_post_tracked_packet_usa',
     canada_post_expedited_parcel_usa = 'canada_post_expedited_parcel_usa',
     usps_express = 'usps_express',
     usps_first = 'usps_first',
     usps_ground_advantage = 'usps_ground_advantage',
     usps_library_mail = 'usps_library_mail',
     usps_media_mail = 'usps_media_mail',
     usps_priority = 'usps_priority',
     usps_other = 'usps_other',
     chit_chats_canada_tracked = 'chit_chats_canada_tracked',
     chit_chats_select = 'chit_chats_select',
     chit_chats_slim = 'chit_chats_slim',
     chit_chats_international_tracked = 'chit_chats_international_tracked',
     usps_express_mail_international = 'usps_express_mail_international',
     usps_first_class_mail_international = 'usps_first_class_mail_international',
     usps_first_class_package_international_service = 'usps_first_class_package_international_service',
     usps_priority_mail_international = 'usps_priority_mail_international',
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

export enum chitchat_cheapest_postage_type_requested {
     yes = 'yes',
     no = 'no',
}

export enum chitChatShipment_status {
     canceled = 'canceled', // Shipment has been canceled to prevent delivery and will either be held at a branch or returned to the client.
     pending = 'pending', // Shipment is in the process of being created by the client. Shipments in this state cannot be received by Chat Chats.
     ready = 'ready', // Shipment is ready to be received by Chit Chats. This means the postage has been purchased or provided.
     in_transit = 'in_transit', // Shipment is in the process of being delivered.
     received = 'received', // Shipment has been received by Chit Chats.
     released = 'released', // Chit Chats has released the shipment to the carrier.
     inducted = 'inducted', // Shipment is confirmed by tracking event to be in possesion by the shipping carrier.
     resolved = 'resolved', // Shipment has been resolved.
     delivered = 'delivered', // Shipment resolved as delivered.
     exception = 'exception', // Shipment resolved as exception meaning that there may have been a problem delivering the shipment.
     voided = 'voided', // Shipment resolved as voided because a postage refund was requested.
}
