// Enums for better type safety
export enum WeightUnit {
    OUNCES = 'ounces',
    POUNDS = 'pounds',
    GRAMS = 'grams',
    KILOGRAMS = 'kilograms'
}

export enum CarrierCode {
    USPS = 'stamps_com',
    FEDEX = 'fedex',
    UPS = 'ups',
    DHL_EXPRESS = 'dhl_express',
    CANADA_POST = 'canada_post'
}

export enum PackageCode {
    PACKAGE = 'package',
    THICK_ENVELOPE = 'thick_envelope',
    LARGE_ENVELOPE = 'large_envelope_or_flat',
    FLAT_RATE_ENVELOPE = 'flat_rate_envelope',
    FLAT_RATE_LEGAL_ENVELOPE = 'flat_rate_legal_envelope',
    FLAT_RATE_PADDED_ENVELOPE = 'flat_rate_padded_envelope',
    SMALL_FLAT_RATE_BOX = 'small_flat_rate_box',
    MEDIUM_FLAT_RATE_BOX = 'medium_flat_rate_box',
    LARGE_FLAT_RATE_BOX = 'large_flat_rate_box'
}

// Product interface
export interface ProductInfo {
    price: number;
    weight: number;
    weightUnit?: WeightUnit | string;
    length?: number;        // in inches
    width?: number;         // in inches
    height?: number;        // in inches
    adminFee?: number;
    carrierCode?: CarrierCode | string;
    packageCode?: PackageCode | string;
}

// Shipping address interface
export interface ShippingAddress {
    street?: string;        // Optional for rate calculation
    city: string;
    state: string;          // State code (e.g., "CA", "NY")
    postalCode: string;
    country?: string;       // Default: "US"
    residential?: boolean;  // Default: true
}

// Warehouse address interface
export interface WarehouseAddress {
    postalCode: string;
    country?: string;       // Default: "US"
}

// Main payload interface
export interface ShipStationOrderPayload {
    product: ProductInfo;
    shippingAddress: ShippingAddress;
    warehouseAddress: WarehouseAddress;
    selectedCarrier?: CarrierCode | string;  // Optional: if user pre-selects carrier
}

// Response interfaces
export interface CostBreakdown {
    productPrice: number;
    adminFee: number;
    currency: string;
}

export interface ShippingOption {
    carrierCode: string;
    carrierName: string;
    serviceCode: string;
    serviceName: string;
    shippingCost: number;
    totalAmount: number;
    estimatedDeliveryDays?: number;
}

export interface CheapestOption {
    carrierName: string;
    serviceName: string;
    shippingCost: number;
    totalAmount: number;
}

export interface ShipStationOrderResponse {
    breakdown: CostBreakdown;
    cheapestOption: CheapestOption;
    allShippingOptions: ShippingOption[];
}

// Error response interface
export interface ShipStationErrorResponse {
    error: string;
    message?: string;
}


export enum ChitChatsWeightUnit {
    GRAMS = 'g',
    KILOGRAMS = 'kg',
    OUNCES = 'oz',
    POUNDS = 'lb'
}

export enum ChitChatsSizeUnit {
    CENTIMETERS = 'cm',
    INCHES = 'in'
}

export enum ChitChatsPackageType {
    PARCEL = 'parcel',
    THICK_ENVELOPE = 'thick_envelope',
    LETTER = 'letter'
}

export interface ChitChatsProductInfo {
    price: number;
    weight: number;
    weightUnit?: ChitChatsWeightUnit | string;
    length?: number;
    width?: number;
    height?: number;
    sizeUnit?: ChitChatsSizeUnit | string;
    adminFee?: number;
    description: string;    // Required, min 3 characters
    packageType?: ChitChatsPackageType | string;
}

export interface ChitChatsShippingAddress {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    provinceCode: string;   // e.g., "ON", "BC", "CA", "NY"
    postalCode: string;
    countryCode: string;    // e.g., "CA", "US"
    phone?: string;
    email?: string;
}

export interface ChitChatsWarehouseAddress {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    provinceCode: string;
    postalCode: string;
    countryCode: string;
    phone?: string;
}

export interface ChitChatsShippingPayload {
    product: ChitChatsProductInfo;
    shippingAddress: ChitChatsShippingAddress;
    warehouseAddress: ChitChatsWarehouseAddress;
}

export interface ChitChatsShippingOption {
    postageType: string;
    serviceName: string;
    shippingCost: number;
    totalAmount: number;
    rate: number;
}

export interface ChitChatsCostBreakdown {
    productPrice: number;
    adminFee: number;
    currency: string;
}

export interface ChitChatsShippingResponse {
    breakdown: ChitChatsCostBreakdown;
    cheapestOption: {
        postageType: string;
        serviceName: string;
        shippingCost: number;
        totalAmount: number;
    };
    allShippingOptions: ChitChatsShippingOption[];
}

export interface ChitChatsErrorResponse {
    error: string;
    message?: string;
}

