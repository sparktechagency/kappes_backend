// src/app/modules/third-party-modules/chitChatShipment/chitChatShipment.service.ts
import { StatusCodes } from 'http-status-codes';
import axios, { AxiosError } from 'axios';
import config from '../../../../config';
import {
     // IChitChatShipment,
     IShipmentStatus,
     IShipmentListResponse,
     IUpdateShipmentRequest,
     IShipmentBuyResponse,
     ICancelShipmentResponse,
     IPrintShipmentResponse,
     ILabelResponse,
     ITrackingResponse,
     IShipmentFilters,
} from './chitChatShipment.interface';
import AppError from '../../../../errors/AppError';

const API_BASE_URL = 'https://chitchats.com/api/v1';
const CLIENT_ID = config.chitchat.client_id;
// console.log('client id', CLIENT_ID);

const getAuthHeaders = () => ({
     'Authorization': `Bearer ${config.chitchat.access_token}`,
     'Content-Type': 'application/json',
     'Accept': 'application/json',
});

// Add proper error handling and return types
const handleApiError = (error: unknown, defaultMessage: string): never => {
     if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
               const status = axiosError.response.status;
               const data = axiosError.response.data as { message?: string; errors?: any };

               throw new AppError(status, data?.message || defaultMessage, data?.errors || undefined);
          } else if (axiosError.request) {
               throw new AppError(StatusCodes.REQUEST_TIMEOUT, 'No response received from ChitChats API');
          }
     }

     throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, defaultMessage);
};

// Create a new shipment
const createShipment = async (payload: any): Promise<any> => {
     // console.log('payload =>', payload);

     console.log('route hit hoise!!');
     try {
          const payload = {
               name: 'John Smith', // required
               address_1: '21000 Hacienda BLVD', // required
               // address_2: 'Building B Apartment G06',
               city: 'California City', // required
               province_code: 'CA',
               postal_code: '93505',
               country_code: 'US', // required
               phone: '415-555-0110',
               package_contents: 'merchandise', // ***
               description: 'Hand made bracelet',
               value: '84.99', // required
               value_currency: 'usd', // required
               // order_id: '',
               // order_store: '',
               package_type: 'parcel', // required
               weight_unit: 'g', // required
               weight: 250, // required
               size_unit: 'cm', // required
               size_x: 10, // required
               size_y: 5, // required
               size_z: 2, // required
               insurance_requested: true,
               signature_requested: false,
               // vat_reference: '',
               // duties_paid_requested: false,
               postage_type: 'chit_chats_us_edge',
               cheapest_postage_type_requested: 'no',
               // tracking_number: '',
               ship_date: '2025-12-24',
               line_items: [
                    {
                         quantity: 1,
                         description: 'Hand made bracelet',
                         value_amount: '84.49',
                         currency_code: 'usd',
                         hs_tariff_code: '7117199000',
                         sku_code: null,
                         origin_country: 'CN',
                         weight: 250,
                         weight_unit: 'g',
                         manufacturer_contact: 'Shenzhen Artisan Jewelry Co.',
                         manufacturer_street: '88 Innovation Rd.',
                         manufacturer_street_2: 'Building 5',
                         manufacturer_city: 'Shenzhen',
                         manufacturer_postal_code: '518000',
                         manufacturer_province_code: 'GD',
                         manufacturer_country_code: 'CN',
                    },
               ],
          };

          // const response = await axios.post(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments`, payload, { headers: getAuthHeaders() });

          const response = await axios.post(`https://chitchats.com/api/v1/clients/918456/shipments`, payload, {
               headers: {
                    'Authorization': `7c493995183240718d2fd067b62fc3dd`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
               },
          });
          console.log('response =>>>>>>>>>>>>>>', response.data);
          return response.data;

          // POST /shipments/{shipment_id}/purchase
     } catch (error: any) {
          console.log('🚀 ~ createShipment ~ error.response:', error.response);
          console.log('🚀 ~ createShipment ~ error.response.data:', error.response.data);
          console.log('🚀 ~ createShipment ~ error.response.data.error:', error.response.data.error);
          return handleApiError(error, 'Failed to create shipment');
     }
};

// List all shipments with optional filters
const buyShipment = async (): Promise<any> => {
     console.log('hit hoise buy shipment!!');
     const payload = {
          postage_type: 'chit_chats_us_edge',
     };
     try {
          const response = await axios.patch(`https://chitchats.com/api/v1/clients/918456/shipments/Z4G2F3J1K2/buy`, payload, {
               headers: {
                    'Authorization': `7c493995183240718d2fd067b62fc3dd`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
               },
          });
          console.log('response =>>>>>>>>>>>>>>', response.data);
          return response.data;
     } catch (error: any) {
          console.log('error =>>>>>>>>>>', error.response.data.error);
          return handleApiError(error, 'Failed to fetch shipments');
     }
};

const listShipments = async (filters?: IShipmentFilters): Promise<IShipmentListResponse> => {
     try {
          const response = await axios.get(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments`, {
               params: filters,
               headers: getAuthHeaders(),
          });
          return response.data;
     } catch (error) {
          return handleApiError(error, 'Failed to fetch shipments');
     }
};

// Get a single shipment by ID
const getShipment = async (shipmentId: string): Promise<any> => {
     try {
          const response = await axios.get(`https://chitchats.com/api/v1/clients/918456/shipments/Z4G2F3J1K2`, {
               headers: {
                    'Authorization': `7c493995183240718d2fd067b62fc3dd`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
               },
          });
          console.log('response =>>>>>>>>>>>>>>', response.data.rates);
          return response.data;
     } catch (error) {
          return handleApiError(error, `Failed to fetch shipment ${shipmentId}`);
     }
};

// Update a shipment
const updateShipment = async (shipmentId: string, updates: IUpdateShipmentRequest): Promise<IShipmentStatus> => {
     try {
          const response = await axios.patch(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}`, updates, { headers: getAuthHeaders() });
          return response.data;
     } catch (error) {
          return handleApiError(error, `Failed to update shipment ${shipmentId}`);
     }
};

// Delete a shipment
const deleteShipment = async (shipmentId: string): Promise<{ success: boolean }> => {
     try {
          await axios.delete(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}`, { headers: getAuthHeaders() });
          return { success: true };
     } catch (error) {
          return handleApiError(error, `Failed to delete shipment ${shipmentId}`);
     }
};

// Buy a shipping label for a shipment
// const buyShipment = async (shipmentId: string): Promise<IShipmentBuyResponse> => {
//      try {
//           const response = await axios.post(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/buy`, {}, { headers: getAuthHeaders() });
//           return response.data;
//      } catch (error) {
//           return handleApiError(error, `Failed to buy label for shipment ${shipmentId}`);
//      }
// };

// Cancel a shipment
const cancelShipment = async (shipmentId: string): Promise<ICancelShipmentResponse> => {
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/cancel`, {}, { headers: getAuthHeaders() });
          return response.data;
     } catch (error) {
          return handleApiError(error, `Failed to cancel shipment ${shipmentId}`);
     }
};

// Print a shipping label
const printShipment = async (shipmentId: string, format: 'PDF' | 'PNG' | 'ZPL' = 'PDF'): Promise<IPrintShipmentResponse> => {
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/print`, { format }, { headers: getAuthHeaders() });
          return response.data;
     } catch (error) {
          return handleApiError(error, `Failed to print label for shipment ${shipmentId}`);
     }
};

// Get a shipping label
const getShipmentLabel = async (shipmentId: string, format: string = 'PDF'): Promise<ILabelResponse> => {
     try {
          const response = await axios.get(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/label`, {
               params: { format },
               headers: getAuthHeaders(),
          });
          return response.data;
     } catch (error) {
          return handleApiError(error, `Failed to get label for shipment ${shipmentId}`);
     }
};

// Get tracking information for a shipment
const getShipmentTracking = async (shipmentId: string): Promise<ITrackingResponse> => {
     try {
          const response = await axios.get(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/tracking`, { headers: getAuthHeaders() });
          return response.data;
     } catch (error) {
          return handleApiError(error, `Failed to get tracking for shipment ${shipmentId}`);
     }
};

export const chitChatShipmentService = {
     createShipment,
     listShipments,
     getShipment,
     updateShipment,
     deleteShipment,
     buyShipment,
     // buyShipment,
     cancelShipment,
     printShipment,
     getShipmentLabel,
     getShipmentTracking,
};
