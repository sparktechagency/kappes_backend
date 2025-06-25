export enum ORDER_STATUS {
    PENDING = 'Pending',
    PROCESSING = 'Processing',
    COMPLETED = 'Completed',
    CANCELLED = 'Cancelled',
}

export enum PAYMENT_METHOD {
    CASH = 'Cash',
    CARD = 'Card',
    ONLINE = 'Online',
}

export enum PAYMENT_STATUS {
    PENDING = 'Pending',
    PAID = 'Paid',
    FAILED = 'Failed',
}

export const FREE_SHIPPING_CHARGE_AREA = ["dhaka"];
export const CENTRAL_SHIPPING_AREA = [
        "barisal",
        "chittagong",
        "dhaka",
        "khulna",
        "mymensingh",
        "rajshahi",
        "rangpur",
        "sylhet",
    ];
export const COUNTRY_SHIPPING_AREA = [
        "bangladesh",
        "bd",
        "bengladesh",
        "bangla",
        "bangal",
        "bangla dash",
    ];
export enum SHIPPING_COST {
        FREE = 0,
        CENTRAL = 60,
        COUNTRY = 120,
        WORLD_WIDE = 120,
    }