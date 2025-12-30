import { IJwtPayload } from "../auth/auth.interface";
import { Buffer } from 'buffer';
import { ShippingKeys } from "./shipping.model";
import { CarrierCode, ChitChatsPackageType, ChitChatsShippingOption, ChitChatsShippingPayload, ChitChatsShippingResponse, ChitChatsSizeUnit, ChitChatsWeightUnit, PackageCode, ShippingOption, ShipStationOrderPayload, ShipStationOrderResponse, ShipStationOrderStatus, WeightUnit } from "./shipping.types";
import AppError from "../../../errors/AppError";
import { deleteChitChatsShipment, getCarrierName, getChitChatsServiceName, getShipStationAuth, handleAxiosError, validateChitChatsPayload } from "./shipping.utils";
import axios, { AxiosError, AxiosResponse } from "axios";

const getListOrders = async (query: any) => { console.log(query); };
const createOrder = async (payload: any, user: IJwtPayload) => { console.log(payload, user); };
const createLabelForOrder = async (payload: any, user: IJwtPayload) => { console.log(payload, user); };
const getCarriers = async (query: any) => { console.log(query); };
const getListServices = async (query: any) => { console.log(query); };


const getShipStationOrderCost = async (
    payload: ShipStationOrderPayload, user: IJwtPayload
): Promise<ShipStationOrderResponse> => {
    try {
        const {
            product,
            shippingAddress,
            warehouseAddress
        } = payload;

        // Validate required fields
        if (!product || !shippingAddress || !warehouseAddress) {
            throw new AppError(404, 'Missing required fields');
        }

        const shipKeys = await ShippingKeys.findOne({ user: user.id, type: 'ship-station' });
        if (!shipKeys) {
            throw new AppError(404, 'No Shipping Keys found for this shop owner');
        }
        const SHIPSTATION_API_KEY = shipKeys?.shipstation_api_key;
        const SHIPSTATION_API_SECRET = shipKeys?.shipstation_api_secret;

        if (!SHIPSTATION_API_KEY || !SHIPSTATION_API_SECRET) {
            throw new AppError(404, 'ShipStation API credentials not configured');
        }

        const authToken = Buffer.from(
            `${SHIPSTATION_API_KEY}:${SHIPSTATION_API_SECRET}`
        ).toString('base64');

        const carriersToCheck: string[] = [
            CarrierCode.USPS,
            CarrierCode.FEDEX,
            CarrierCode.UPS
        ];

        const baseRateRequest = {
            packageCode: product.packageCode || PackageCode.PACKAGE,
            fromPostalCode: warehouseAddress.postalCode,
            toState: shippingAddress.state,
            toCountry: shippingAddress.country || "US",
            toPostalCode: shippingAddress.postalCode,
            toCity: shippingAddress.city,
            weight: {
                value: product.weight || 1,
                units: product.weightUnit || WeightUnit.OUNCES
            },
            dimensions: {
                units: "inches",
                length: product.length || 10,
                width: product.width || 8,
                height: product.height || 4
            },
            confirmation: "none",
            residential: shippingAddress.residential !== false
        };

        const allRatesPromises = carriersToCheck.map(async (carrierCode) => {
            try {
                const rateRequest = {
                    ...baseRateRequest,
                    carrierCode,
                    serviceCode: null
                };

                const response = await axios.post(
                    'https://ssapi.shipstation.com/shipments/getrates',
                    rateRequest,
                    {
                        headers: {
                            'Authorization': `Basic ${authToken}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const rates = response.data;
                console.log(`✓ Successfully got rates from ${carrierCode}`);
                return rates || [];

            } catch (error) {
                const axiosError = error as AxiosError;
                console.warn(`✗ Failed to get rates for ${carrierCode}:`, handleAxiosError(axiosError));
                return []; // Return empty array, don't throw
            }
        });

        const allRatesArrays = await Promise.all(allRatesPromises);
        const allRates = allRatesArrays.flat();

        if (allRates.length === 0) {
            throw new AppError(404, 'No shipping rates found from any carrier');
        }

        const productPrice = parseFloat(product.price.toString()) || 0;
        const adminFee = parseFloat(product.adminFee?.toString() || '0') || 0;

        const shippingOptions: ShippingOption[] = allRates.map((rate: any) => {
            const shippingCost = parseFloat(rate.shipmentCost);
            const totalWithShipping = productPrice + adminFee + shippingCost;

            return {
                carrierCode: rate.carrierCode,
                carrierName: getCarrierName(rate.carrierCode),
                serviceCode: rate.serviceCode,
                serviceName: rate.serviceName,
                shippingCost: parseFloat(shippingCost.toFixed(2)),
                totalAmount: parseFloat(totalWithShipping.toFixed(2)),
                estimatedDeliveryDays: rate.shipDate
            };
        });

        shippingOptions.sort((a, b) => a.totalAmount - b.totalAmount);

        const cheapestOption = shippingOptions[0];

        return {
            breakdown: {
                productPrice: parseFloat(productPrice.toFixed(2)),
                adminFee: parseFloat(adminFee.toFixed(2)),
                currency: 'USD'
            },
            cheapestOption: {
                carrierName: cheapestOption.carrierName,
                serviceName: cheapestOption.serviceName,
                shippingCost: cheapestOption.shippingCost,
                totalAmount: cheapestOption.totalAmount
            },
            allShippingOptions: shippingOptions
        };

    } catch (error: any) {
        console.error('ShipStation API Error:', error.message);
        throw new AppError(500, error.message || 'Failed to calculate shipping cost');
    }
};

const getChitChatsShippingCost = async (
    payload: ChitChatsShippingPayload,
    user: IJwtPayload
): Promise<ChitChatsShippingResponse> => {
    let tempShipmentId: string | null = null;

    try {
        // ===== STEP 1: VALIDATE INPUT =====
        validateChitChatsPayload(payload);

        const { product, shippingAddress, warehouseAddress } = payload;

        // ===== STEP 2: GET API CREDENTIALS =====
        const shipKeys = await ShippingKeys.findOne({ user: user.id, type: 'chit-chat' });
        if (!shipKeys) {
            throw new AppError(404, 'No Shipping Keys found for this shop owner');
        }
        const CHITCHATS_CLIENT_ID = shipKeys?.chitchats_client_id;
        const CHITCHATS_API_TOKEN = shipKeys?.chitchats_api_token;
        const CHITCHATS_BASE_URL = process.env.CHITCHATS_BASE_URL || 'https://staging.chitchats.com';

        if (!CHITCHATS_API_TOKEN || !CHITCHATS_CLIENT_ID) {
            throw new AppError(404,
                'Chit Chats API credentials not configured!'
            );
        }

        const baseUrl = `${CHITCHATS_BASE_URL}/api/v1/clients/${CHITCHATS_CLIENT_ID}`;

        console.log('Starting Chit Chats rate calculation...');

        // ===== STEP 3: PREPARE SHIPMENT DATA =====
        const shipmentData = {
            // Recipient information
            name: shippingAddress.name.trim(),
            address_1: shippingAddress.address1.trim(),
            address_2: shippingAddress.address2?.trim() || null,
            city: shippingAddress.city.trim(),
            province_code: shippingAddress.provinceCode.trim(),
            postal_code: shippingAddress.postalCode.trim().replace(/\s+/g, ''),
            country_code: shippingAddress.countryCode.trim().toUpperCase(),
            phone: shippingAddress.phone?.trim() || null,
            email: shippingAddress.email?.trim() || null,

            // Return/Sender information (your warehouse)
            return_name: warehouseAddress.name.trim(),
            return_address_1: warehouseAddress.address1.trim(),
            return_address_2: warehouseAddress.address2?.trim() || null,
            return_city: warehouseAddress.city.trim(),
            return_province_code: warehouseAddress.provinceCode.trim(),
            return_postal_code: warehouseAddress.postalCode.trim().replace(/\s+/g, ''),
            return_country_code: warehouseAddress.countryCode.trim().toUpperCase(),
            return_phone: warehouseAddress.phone?.trim() || null,

            // Package information
            description: product.description.trim(),
            value: parseFloat(product.price.toString()).toFixed(2),
            value_currency: 'CAD', // Chit Chats typically uses CAD
            package_type: product.packageType || ChitChatsPackageType.PARCEL,

            // Dimensions
            size_unit: product.sizeUnit || ChitChatsSizeUnit.CENTIMETERS,
            size_x: product.length || 20,
            size_y: product.width || 15,
            size_z: product.height || 10,

            // Weight
            weight_unit: product.weightUnit || ChitChatsWeightUnit.GRAMS,
            weight: product.weight,

            // Postage settings - 'unknown' tells Chit Chats to return all available rates
            postage_type: 'unknown',
            cheapest_postage_type_requested: 'yes',

            ship_date: 'today'
        };

        // Configure axios headers
        const axiosConfig = {
            headers: {
                'Authorization': CHITCHATS_API_TOKEN,
                'Content-Type': 'application/json'
            }
        };

        console.log('Creating temporary Chit Chats shipment...');

        // ===== STEP 4: CREATE TEMPORARY SHIPMENT =====
        let createResponse: AxiosResponse;
        try {
            createResponse = await axios.post(
                `${baseUrl}/shipments`,
                shipmentData,
                axiosConfig
            );
        } catch (error) {
            throw new Error(handleAxiosError(error as AxiosError));
        }

        const shipmentResult = createResponse.data;
        tempShipmentId = shipmentResult.id;

        if (!tempShipmentId) {
            throw new AppError(404, 'Failed to create temporary shipment - no shipment ID returned');
        }

        console.log(`Temporary shipment created with ID: ${tempShipmentId}`);

        // ===== STEP 5: REFRESH SHIPMENT TO GET RATES =====
        console.log('Fetching available shipping rates...');

        let refreshResponse: AxiosResponse;
        try {
            refreshResponse = await axios.patch(
                `${baseUrl}/shipments/${tempShipmentId}/refresh`,
                { ship_date: 'today' },
                axiosConfig
            );
        } catch (error) {
            throw new Error(handleAxiosError(error as AxiosError));
        }

        const refreshedShipment = refreshResponse.data;

        // ===== STEP 6: EXTRACT AND VALIDATE RATES =====
        const availableRates = refreshedShipment.postage_rates || [];

        if (!Array.isArray(availableRates)) {
            throw new AppError(404, 'Invalid response format from Chit Chats API - postage_rates is not an array');
        }

        if (availableRates.length === 0) {
            throw new AppError(404,
                'No shipping rates available for this destination. ' +
                'Please verify the shipping address is correct and serviceable by Chit Chats.'
            );
        }

        console.log(`Found ${availableRates.length} shipping options`);

        // ===== STEP 7: CALCULATE COSTS =====
        const productPrice = parseFloat(product.price.toString());
        const adminFee = parseFloat(product.adminFee?.toString() || '0');

        const shippingOptions: ChitChatsShippingOption[] = availableRates.map((rate: any) => {
            const shippingCost = parseFloat(rate.rate || '0');
            const totalAmount = productPrice + adminFee + shippingCost;

            return {
                postageType: rate.postage_type,
                serviceName: getChitChatsServiceName(rate.postage_type),
                shippingCost: parseFloat(shippingCost.toFixed(2)),
                totalAmount: parseFloat(totalAmount.toFixed(2)),
                rate: parseFloat(shippingCost.toFixed(2))
            };
        });

        // Sort by total cost (cheapest first)
        shippingOptions.sort((a, b) => a.totalAmount - b.totalAmount);

        const cheapestOption = shippingOptions[0];

        // ===== STEP 8: CLEANUP - DELETE TEMPORARY SHIPMENT =====
        await deleteChitChatsShipment(baseUrl, tempShipmentId, CHITCHATS_API_TOKEN);
        console.log('Chit Chats rate calculation completed successfully');

        // ===== STEP 9: RETURN FORMATTED RESPONSE =====
        return {
            breakdown: {
                productPrice: parseFloat(productPrice.toFixed(2)),
                adminFee: parseFloat(adminFee.toFixed(2)),
                currency: 'CAD'
            },
            cheapestOption: {
                postageType: cheapestOption.postageType,
                serviceName: cheapestOption.serviceName,
                shippingCost: cheapestOption.shippingCost,
                totalAmount: cheapestOption.totalAmount
            },
            allShippingOptions: shippingOptions
        };

    } catch (error: any) {
        // ===== ERROR HANDLING WITH CLEANUP =====
        console.error('Chit Chats API Error:', error.message);

        // Try to clean up temporary shipment even on error
        if (tempShipmentId) {
            try {
                const CHITCHATS_API_TOKEN = process.env.CHITCHATS_API_TOKEN;
                const CHITCHATS_CLIENT_ID = process.env.CHITCHATS_CLIENT_ID;
                const CHITCHATS_BASE_URL = process.env.CHITCHATS_BASE_URL || 'https://staging.chitchats.com';
                const baseUrl = `${CHITCHATS_BASE_URL}/api/v1/clients/${CHITCHATS_CLIENT_ID}`;

                if (CHITCHATS_API_TOKEN) {
                    await deleteChitChatsShipment(baseUrl, tempShipmentId, CHITCHATS_API_TOKEN);
                    console.log('Cleaned up temporary shipment after error');
                }
            } catch (cleanupError) {
                console.warn('Failed to clean up temporary shipment:', cleanupError);
            }
        }

        // Re-throw with clear error message
        throw new AppError(404, error.message || 'Failed to calculate Chit Chats shipping cost');
    }
};

const createShipStationOrder = async (user: any, order: any) => {

    // 1️⃣ Fetch ShipStation credentials
    const shipKeys = await ShippingKeys.findOne({
        user: user.id,
        type: "ship-station",
    });

    if (!shipKeys) {
        throw new AppError(404, "No ShipStation keys found for this shop owner");
    }

    const { shipstation_api_key, shipstation_api_secret } = shipKeys;

    if (!shipstation_api_key || !shipstation_api_secret) {
        throw new AppError(400, "ShipStation API credentials missing");
    }

    // 2️⃣ Auth header
    const auth = getShipStationAuth(
        shipstation_api_key,
        shipstation_api_secret
    );

    // 3️⃣ Calculate total weight
    const totalWeight = order.products.reduce(
        (sum: number, p: any) => sum + (p.weight * p.quantity),
        0
    );

    // 4️⃣ Format address (VERY IMPORTANT)
    const formatAddress = (addr: any) => ({
        name: addr.name || user.name,
        street1: addr.addressLine1,
        street2: addr.addressLine2 || "",
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country || "BD",
        phone: addr.phone || user.phone,
    });

    // 5️⃣ Create ShipStation Order
    const orderRes = await axios.post(
        "https://ssapi.shipstation.com/orders/createorder",
        {
            orderNumber: order._id.toString(),
            orderDate: new Date(),
            orderStatus: "awaiting_shipment",

            billTo: formatAddress(order.shippingAddress),
            shipTo: formatAddress(order.shippingAddress),

            items: order.products.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                weight: {
                    value: item.weight,
                    units: "kilograms",
                },
            })),

            amountPaid: order.totalAmount,
        },
        {
            headers: {
                Authorization: auth,
                "Content-Type": "application/json",
            },
        }
    );

    const shipStationOrderId = orderRes.data.orderId;

    // 6️⃣ Create Shipping Label
    const labelRes = await axios.post(
        "https://ssapi.shipstation.com/shipments/createlabel",
        {
            orderId: shipStationOrderId,
            carrierCode: order.carrierCode || "fedex",
            serviceCode: order.serviceCode || "fedex_ground",
            packageCode: "package",
            shipDate: new Date(),

            weight: {
                value: totalWeight,
                units: "kilograms",
            },
        },
        {
            headers: {
                Authorization: auth,
                "Content-Type": "application/json",
            },
        }
    );

    // 7️⃣ Return ONLY what you need
    return {
        shipStationOrderId,
        shipmentId: labelRes.data.shipmentId,
        trackingNumber: labelRes.data.trackingNumber,
        labelUrl: labelRes.data.labelDownload?.href,
        carrierCode: labelRes.data.carrierCode,
        serviceCode: labelRes.data.serviceCode,
    };
}

const getShipStationOrderStatus = async (
    userId: string,
    shipStationOrderId: number
): Promise<ShipStationOrderStatus> => {

    // 1️⃣ Get ShipStation credentials
    const shipKeys = await ShippingKeys.findOne({
        user: userId,
        type: "ship-station",
    });

    if (!shipKeys) {
        throw new AppError(404, "ShipStation credentials not found");
    }

    const { shipstation_api_key, shipstation_api_secret } = shipKeys;

    if (!shipstation_api_key || !shipstation_api_secret) {
        throw new AppError(404, 'ShipStation API credentials not configured');
    }

    const auth = getShipStationAuth(
        shipstation_api_key,
        shipstation_api_secret
    );

    // 2️⃣ Fetch order info
    const orderRes = await axios.get(
        "https://ssapi.shipstation.com/orders/getorder",
        {
            params: { orderId: shipStationOrderId },
            headers: {
                Authorization: auth,
            },
        }
    );

    const order = orderRes.data;

    // 3️⃣ Fetch shipment info (if exists)
    let shipmentStatus = undefined;
    let trackingNumber = undefined;
    let carrierCode = undefined;
    let serviceCode = undefined;

    if (order.shipments?.length > 0) {
        const shipment = order.shipments[0];

        shipmentStatus = shipment.shipmentStatus;
        trackingNumber = shipment.trackingNumber;
        carrierCode = shipment.carrierCode;
        serviceCode = shipment.serviceCode;
    }

    // 4️⃣ Normalize & return
    return {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        shipmentStatus,
        trackingNumber,
        carrierCode,
        serviceCode,
    };
};

// const refandOrderPaymentToCustomer = async (orderId: string) => {  console.log(orderId); };

export const ShippingService = {
    getListOrders,
    createOrder,
    createLabelForOrder,
    getCarriers,
    getListServices,
    getShipStationOrderCost,
    getChitChatsShippingCost,
    createShipStationOrder,
    getShipStationOrderStatus
}