// src/app/modules/third-party-modules/chitChatShipment/chitChatShipment.service.ts
import { StatusCodes } from 'http-status-codes';
import axios, { AxiosError } from 'axios';
import config from '../../../../config';
import {
     // IChitChatShipment,
     IShipmentStatus,
     IShipmentListResponse,
     IUpdateShipmentRequest,
     ICancelShipmentResponse,
     IPrintShipmentResponse,
     ILabelResponse,
     ITrackingResponse,
     IShipmentFilters,
} from './chitChatShipment.interface';
import AppError from '../../../../errors/AppError';
import { chitChatShipment_postage_type } from './chitChatShipment.enum';

const API_BASE_URL = 'https://chitchats.com/api/v1';
const CLIENT_ID = config.chitchat.client_id;
// console.log('client id', CLIENT_ID);

const getAuthHeaders = () => ({
     'Authorization': `${config.chitchat.access_token}`,
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
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments`, payload, { headers: getAuthHeaders() });
          return response.data;
     } catch (error: any) {
          return handleApiError(error, 'Failed to create shipment');
     }
};

const listShipments = async (filters?: IShipmentFilters): Promise<IShipmentListResponse> => {
     if (filters?.page || filters?.limit) {
          filters.page = Number(filters.page);
          filters.limit = Number(filters.limit);
     }
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
          const response = await axios.get(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}`, {
               headers: getAuthHeaders(),
          });
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

// List all shipments with optional filters
const buyShipment = async (
     shipmentId: string,
     payload: {
          postage_type: chitChatShipment_postage_type;
     },
): Promise<any> => {
     try {
          const response = await axios.patch(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/buy`, payload, {
               headers: getAuthHeaders(),
          });
          return response.data;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error.response.data.error.message);
     }
};

// Cancel a shipment
const cancelShipment = async (shipmentId: string): Promise<ICancelShipmentResponse> => {
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/cancel`, {}, { headers: getAuthHeaders() });
          return response.data;
     } catch (error) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

// Cancel a shipment
const refundShipment = async (shipmentId: string): Promise<ICancelShipmentResponse> => {
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/refund`, {}, { headers: getAuthHeaders() });
          return response.data;
     } catch (error) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
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
          const response = await axios.get(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}`, { headers: getAuthHeaders() });
          return response.data?.shipment?.tracking_url;
     } catch (error) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

export const chitChatShipmentService = {
     createShipment,
     listShipments,
     getShipment,
     updateShipment,
     deleteShipment,
     buyShipment,
     cancelShipment,
     refundShipment,
     printShipment,
     getShipmentLabel,
     getShipmentTracking,
};
