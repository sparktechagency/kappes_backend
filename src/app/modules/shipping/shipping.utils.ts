// ============= HELPER FUNCTIONS =============

import axios, { AxiosError } from "axios";
import { ChitChatsShippingPayload } from "./shipping.types";
import { Buffer } from 'buffer';
/**
 * Get human-readable service names for Chit Chats postage types
 */
export const getChitChatsServiceName = (postageType: string): string => {
    const serviceNames: { [key: string]: string } = {
        // Canadian Services
        'chit_chats_canada_tracked': 'Chit Chats Canada Tracked',
        'chit_chats_select': 'Chit Chats Select',
        
        // US Services
        'chit_chats_us_tracked': 'Chit Chats U.S. Tracked',
        'chit_chats_us_economy_tracked': 'Chit Chats U.S. Economy Tracked',
        
        // International Services
        'chit_chats_international_tracked': 'Chit Chats International Tracked',
        
        // USPS Services (via Chit Chats)
        'usps_priority': 'USPS Priority Mail',
        'usps_first_class_mail': 'USPS First Class Mail',
        'usps_priority_express': 'USPS Priority Express',
        'usps_ground_advantage': 'USPS Ground Advantage',
        'usps_media_mail': 'USPS Media Mail',
        'usps_parcel_select': 'USPS Parcel Select',
        
        // Canada Post Services
        'canada_post_expedited_parcel': 'Canada Post Expedited Parcel',
        'canada_post_tracked_packet_usa': 'Canada Post Tracked Packet USA',
        'canada_post_tracked_packet_international': 'Canada Post Tracked Packet International',
    };
    
    // If not found in map, format the postage type nicely
    return serviceNames[postageType] || 
           postageType.replace(/_/g, ' ')
                     .replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Delete a temporary shipment from Chit Chats
 */
export const deleteChitChatsShipment = async (
    baseUrl: string, 
    shipmentId: string, 
    apiToken: string
): Promise<void> => {
    try {
        await axios.delete(`${baseUrl}/shipments/${shipmentId}`, {
            headers: {
                'Authorization': apiToken
            }
        });
        console.log(`Successfully deleted temporary shipment: ${shipmentId}`);
    } catch (error) {
        console.warn('Error deleting temporary shipment:', error);
        // Don't throw - this is cleanup, not critical
    }
};

/**
 * Validate the payload before making API calls
 */
export const validateChitChatsPayload = (payload: ChitChatsShippingPayload): void => {
    const { product, shippingAddress, warehouseAddress } = payload;

    // Check main objects exist
    if (!product || !shippingAddress || !warehouseAddress) {
        throw new Error('Missing required fields: product, shippingAddress, or warehouseAddress');
    }

    // Validate product
    if (!product.description || product.description.trim().length < 3) {
        throw new Error('Product description must be at least 3 characters');
    }
    if (!product.price || product.price <= 0) {
        throw new Error('Product price must be greater than 0');
    }
    if (!product.weight || product.weight <= 0) {
        throw new Error('Product weight must be greater than 0');
    }

    // Validate shipping address
    if (!shippingAddress.name || !shippingAddress.address1) {
        throw new Error('Shipping address must include name and address1');
    }
    if (!shippingAddress.city || !shippingAddress.provinceCode || !shippingAddress.postalCode) {
        throw new Error('Shipping address must include city, provinceCode, and postalCode');
    }
    if (!shippingAddress.countryCode) {
        throw new Error('Shipping address must include countryCode');
    }

    // Validate warehouse address
    if (!warehouseAddress.name || !warehouseAddress.address1) {
        throw new Error('Warehouse address must include name and address1');
    }
    if (!warehouseAddress.city || !warehouseAddress.provinceCode || !warehouseAddress.postalCode) {
        throw new Error('Warehouse address must include city, provinceCode, and postalCode');
    }
    if (!warehouseAddress.countryCode) {
        throw new Error('Warehouse address must include countryCode');
    }
};

export const getCarrierName = (carrierCode: string): string => {
    const carrierNames: { [key: string]: string } = {
        'stamps_com': 'USPS',
        'fedex': 'FedEx',
        'ups': 'UPS',
        'dhl_express': 'DHL Express',
        'canada_post': 'Canada Post'
    };
    return carrierNames[carrierCode] || carrierCode;
};

 /**
 * Handle axios errors and extract meaningful error messages
 */
export const handleAxiosError = (error: AxiosError): string => {
    if (error.response) {
        // Server responded with error status
        const data: any = error.response.data;
        if (data?.message) {
            return data.message;
        } else if (data?.error) {
            return data.error;
        } else if (data?.errors) {
            return JSON.stringify(data.errors);
        }
        return `Chit Chats API error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
        // Request made but no response received
        return 'No response from Chit Chats API. Please check your network connection.';
    } else {
        // Error in request setup
        return error.message || 'Failed to make request to Chit Chats API';
    }
};

export function getShipStationAuth(apiKey: string, apiSecret: string) {
  const token = Buffer
    .from(`${apiKey}:${apiSecret}`)
    .toString('base64');

  return `Basic ${token}`;
}