export enum ORDER_STATUS {
     PENDING = 'Pending',
     PROCESSING = 'Processing',
     COMPLETED = 'Completed',
     CANCELLED = 'Cancelled',
}

export enum DeliveryPlatformEnum {
     CHITCHAT = 'ChitChat',
     SHIPSTATION = 'Shipstation',
     OTHER = 'Other',
}

export enum DELIVERY_OPTIONS {
     STANDARD = 'Standard', // 5 days delivery
     EXPRESS = 'Express', // 2 days delivery
     OVERNIGHT = 'Overnight', // 1 day delivery
}
export enum EXTRA_DELIVERY_COST_PERCENT_FOR_DELIVERY_OPTIONS {
     STANDARD = 0,
     EXPRESS = 5,
     OVERNIGHT = 10,
}
export enum DAY_FOR_DELIVERY_OPTIONS {
     STANDARD = 5,
     EXPRESS = 2,
     OVERNIGHT = 1,
}

export enum PAYMENT_METHOD {
     COD = 'Cod',
     CARD = 'Card',
     ONLINE = 'Online',
}

export enum PAYMENT_STATUS {
     UNPAID = 'Unpaid',
     PAID = 'Paid',
     REFUNDED = 'Refunded',
}

export const FREE_SHIPPING_CHARGE_AREA = ['dhaka'];
export const CENTRAL_SHIPPING_AREA = ['barisal', 'chittagong', 'dhaka', 'khulna', 'mymensingh', 'rajshahi', 'rangpur', 'sylhet'];
export const COUNTRY_SHIPPING_AREA = ['bangladesh', 'bd', 'bengladesh', 'bangla', 'bangal', 'bangla dash'];
export enum SHIPPING_COST {
     FREE = 0,
     CENTRAL = 60,
     COUNTRY = 120,
     WORLD_WIDE = 150,
}
