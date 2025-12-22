// src/app/modules/third-party-modules/chitChatShipment/chitChatShipment.service.ts
import { StatusCodes } from 'http-status-codes';
import axios, { AxiosError } from 'axios';
import config from '../../../../config';
import {
     IChitChatShipment,
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
const createShipment = async (payload: IChitChatShipment): Promise<IShipmentStatus> => {
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments`, payload, { headers: getAuthHeaders() });
          return response.data;
     } catch (error) {
          return handleApiError(error, 'Failed to create shipment');
     }
};

// List all shipments with optional filters
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
const getShipment = async (shipmentId: string): Promise<IShipmentStatus> => {
     try {
          const response = await axios.get(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}`, { headers: getAuthHeaders() });
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
const buyShipment = async (shipmentId: string): Promise<IShipmentBuyResponse> => {
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${CLIENT_ID}/shipments/${shipmentId}/buy`, {}, { headers: getAuthHeaders() });
          return response.data;
     } catch (error) {
          return handleApiError(error, `Failed to buy label for shipment ${shipmentId}`);
     }
};

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
     cancelShipment,
     printShipment,
     getShipmentLabel,
     getShipmentTracking,
};
