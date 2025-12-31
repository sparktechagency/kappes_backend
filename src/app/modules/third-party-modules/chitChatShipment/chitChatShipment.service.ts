// src/app/modules/third-party-modules/chitChatShipment/chitChatShipment.service.ts
import { StatusCodes } from 'http-status-codes';
import axios from 'axios';
import {
     // IChitChatShipment,
     // IShipmentStatus,
     // IShipmentListResponse,
     // IUpdateShipmentRequest,
     // ICancelShipmentResponse,
     // IPrintShipmentResponse,
     // ILabelResponse,
     // ITrackingResponse,
     IShipmentFilters,
     IChitChats_CreateShipmentBody,
} from './chitChatShipment.interface';
import AppError from '../../../../errors/AppError';
import {
     // chitchat_cheapest_postage_type_requested,
     chitChatShipment_postage_type,
     // chitChatShipment_size_unit,
     // chitChatShipment_value_currency,
     // chitChatShipment_weight_unit,
     // IchitchatsCreateShipment,
     // ILineItem,
} from './chitChatShipment.enum';
// import { getCart } from '../../cart/cart.service';
// import { User } from '../../user/user.model';
// import { IProduct } from '../../product/product.interface';
// import { IVariant } from '../../variant/variant.interfaces';
// import { ICartItem } from '../../cart/cart.interface';
import { Shop } from '../../shop/shop.model';

const API_BASE_URL = 'https://chitchats.com/api/v1';
// const CLIENT_ID = config.chitchat.client_id;
// // console.log('client id', CLIENT_ID);

// const getAuthHeaders = () => ({
//      'Authorization': `${config.chitchat.access_token}`,
//      'Content-Type': 'application/json',
//      'Accept': 'application/json',
// });

// Create a new shipment
const createShipment = async (payload: IChitChats_CreateShipmentBody, shopId: string) => {
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });

     // const payloadDTO = {
     //      shopId: '6927d490f41476bffbd45219',
     //      name: 'John Smith',
     //      address_1: '21000 Hacienda BLVD',
     //      city: 'California City',
     //      province_code: 'CA',
     //      postal_code: '93505',
     //      country_code: 'US',
     //      phone: '415-555-0110',

     //      package_type: 'parcel',
     //      weight_unit: 'g',
     //      weight: 200,
     //      size_unit: 'cm',
     //      size_x: 10,
     //      size_y: 5,
     //      size_z: 2,

     //      cheapest_postage_type_requested: 'yes',
     //      ship_date: '2025-12-31',

     //      line_items: [
     //           {
     //                quantity: 1,
     //                description: 'Hand made bracelet',
     //                value_amount: '84.49',
     //                currency_code: 'usd',
     //                hs_tariff_code: '7117199000',
     //                origin_country: 'CN',
     //                weight: 100,
     //                weight_unit: 'g',
     //                manufacturer_contact: 'Shenzhen Artisan Jewelry Co.',
     //                manufacturer_street: '88 Innovation Rd.',
     //                manufacturer_city: 'Shenzhen',
     //                manufacturer_postal_code: '518000',
     //                manufacturer_province_code: 'GD',
     //           },
     //           {
     //                quantity: 1,
     //                description: 'Hand made bracelet',
     //                value_amount: '84.49',
     //                currency_code: 'usd',
     //                hs_tariff_code: '7117199000',
     //                origin_country: 'CN',
     //                weight: 100,
     //                weight_unit: 'g',
     //                manufacturer_contact: 'Shenzhen Artisan Jewelry Co.',
     //                manufacturer_street: '88 Innovation Rd.',
     //                manufacturer_city: 'Shenzhen',
     //                manufacturer_postal_code: '518000',
     //                manufacturer_province_code: 'GD',
     //           },
     //      ],
     // };

     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments`, payload, { headers: getAuthHeaders() });
          return response.data;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

const listShipments = async (filters?: IShipmentFilters, shopId?: string) => {
     if (filters?.page || filters?.limit) {
          filters.page = Number(filters.page);
          filters.limit = Number(filters.limit);
     }
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });
     try {
          const response = await axios.get(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments`, {
               params: filters,
               headers: getAuthHeaders(),
          });
          return response.data;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

// Get a single shipment by ID
const getShipment = async (shipmentId: string, shopId?: string) => {
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });
     try {
          const response = await axios.get(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments/${shipmentId}`, {
               headers: getAuthHeaders(),
          });
          return response.data;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

// Delete a shipment
const deleteShipment = async (shipmentId: string, shopId?: string) => {
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });
     try {
          await axios.delete(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments/${shipmentId}`, { headers: getAuthHeaders() });
          return { success: true };
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

// List all shipments with optional filters
const buyShipment = async (
     shipmentId: string,
     payload: {
          postage_type: chitChatShipment_postage_type;
     },
     shopId?: string,
) => {
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });
     try {
          const response = await axios.patch(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments/${shipmentId}/buy`, payload, {
               headers: getAuthHeaders(),
          });
          return response.data;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

// Cancel a shipment
const cancelShipment = async (shipmentId: string, shopId?: string) => {
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments/${shipmentId}/cancel`, {}, { headers: getAuthHeaders() });
          return response.data;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

// Cancel a shipment
const refundShipment = async (shipmentId: string, shopId?: string) => {
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments/${shipmentId}/refund`, {}, { headers: getAuthHeaders() });
          return response.data;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

// Print a shipping label
const printShipment = async (shipmentId: string, format: 'PDF' | 'PNG' | 'ZPL' = 'PDF', shopId?: string) => {
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });
     try {
          const response = await axios.post(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments/${shipmentId}/print`, { format }, { headers: getAuthHeaders() });
          return response.data;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

// Get a shipping label
const getShipmentLabel = async (shipmentId: string, format: string = 'PDF', shopId?: string) => {
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });
     try {
          const response = await axios.get(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments/${shipmentId}/label`, {
               params: { format },
               headers: getAuthHeaders(),
          });
          return response.data;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

// Get tracking information for a shipment
const getShipmentTracking = async (shipmentId: string, shopId?: string) => {
     const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
     if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
     }
     const getAuthHeaders = () => ({
          'Authorization': shop.chitchats_access_token,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
     });
     try {
          const response = await axios.get(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments/${shipmentId}`, { headers: getAuthHeaders() });
          return response.data?.shipment?.tracking_url;
     } catch (error: any) {
          throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
     }
};

/* later */
// // Update a shipment
// const updateShipment = async (shipmentId: string, updates: IUpdateShipmentRequest, shopId?: string) => {
//      const shop = await Shop.findById(shopId).select('chitchats_client_id chitchats_access_token');
//      if (!shop || !shop.chitchats_client_id || !shop.chitchats_access_token) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'ChitChats client ID or access token not found for this shop');
//      }
//      const getAuthHeaders = () => ({
//           'Authorization': shop.chitchats_access_token,
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//      });
//      try {
//           const response = await axios.patch(`${API_BASE_URL}/clients/${shop.chitchats_client_id}/shipments/${shipmentId}`, updates, { headers: getAuthHeaders() });
//           return response.data;
//      } catch (error: any) {
//           throw new AppError(StatusCodes.BAD_REQUEST, error?.response?.data?.error?.message);
//      }
// };

// // create from cart
// export const createShipmentFromCart = async (userId: string | any, payload: { ship_date: string }): Promise<any> => {
//      // Get user's cart
//      const cart = await getCart(userId.toString());

//      if (!cart || cart.items.length === 0) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Cart is empty');
//      }
//      // check if all items from same shop or not
//      const shopIds = cart.items.map((item) => item.shopId.toString());
//      const uniqueShopIds = [...new Set(shopIds)];
//      if (uniqueShopIds.length > 1) {
//           throw new AppError(StatusCodes.BAD_REQUEST, 'Cannot create shipment for items from multiple shops');
//      }

//      // Transform cart items to shipment items
//      const shipmentItems: ILineItem[] = cart.items.map((item: ICartItem) => {
//           if (!item.productId || !item.variantId) {
//                throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid cart item');
//           }

//           const product = item.productId as IProduct;
//           const variant = item.variantId as IVariant;

//           return {
//                description: product.name.toString(),
//                quantity: Number(item.variantQuantity),
//                weight: Number(variant.weight) || 0.1,
//                weight_unit: product.weight_unit?.toString() || chitChatShipment_weight_unit.gram,
//                value_amount: variant.price?.toString() || '0',
//                currency_code: chitChatShipment_value_currency.usd,
//                hs_tariff_code: product.hs_tariff_code?.toString() || '',
//                origin_country: product.origin_country?.toString() || 'CA',
//                manufacturer_contact: product.manufacturer_contact?.toString() || '',
//                manufacturer_street: product.manufacturer_street?.toString() || '',
//                manufacturer_city: product.manufacturer_city?.toString() || '',
//                manufacturer_postal_code: product.manufacturer_postal_code?.toString() || '',
//                manufacturer_province_code: product.manufacturer_province_code?.toString() || '',
//                size_x: Number(product.size_x) || 0,
//                size_y: Number(product.size_y) || 0,
//                size_z: Number(product.size_z) || 0,
//           };
//      });

//      // Get user details
//      const user = await User.findById(userId).select('name email phone address_1 address_2 city province_code postal_code country_code').lean();
//      if (!user) {
//           throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
//      }

//      const size_x = shipmentItems.reduce((acc, item) => {
//           if (acc && item.size_x !== acc) {
//                throw new AppError(StatusCodes.BAD_REQUEST, 'Shipment items have different size_x values');
//           }
//           return item.size_x;
//      }, 0);

//      const size_y = shipmentItems.reduce((acc, item) => {
//           if (acc && item.size_y !== acc) {
//                throw new AppError(StatusCodes.BAD_REQUEST, 'Shipment items have different size_y values');
//           }
//           return item.size_y;
//      }, 0);

//      const size_z = shipmentItems.reduce((acc, item) => {
//           if (acc && item.size_z !== acc) {
//                throw new AppError(StatusCodes.BAD_REQUEST, 'Shipment items have different size_z values');
//           }
//           return item.size_z;
//      }, 0);

//      const weight = shipmentItems.reduce((acc, item) => acc + item.weight, 0);

//      // Prepare shipment payload
//      const shipmentPayload: IchitchatsCreateShipment = {
//           name: user.name?.toString() || 'Customer',
//           address_1: user.address_1?.toString() || '',
//           city: user.city?.toString() || '',
//           province_code: user.province_code?.toString() || '',
//           postal_code: user.postal_code?.toString() || '',
//           country_code: user.country_code?.toString() || 'CA',
//           phone: user.phone?.toString() || '',
//           line_items: shipmentItems,
//           package_type: 'parcel',
//           weight,
//           weight_unit: chitChatShipment_weight_unit.gram,
//           size_x: Number(size_x / shipmentItems.length),
//           size_y: Number(size_y / shipmentItems.length),
//           size_z: Number(size_z / shipmentItems.length),
//           size_unit: chitChatShipment_size_unit.centimeter, // from product
//           cheapest_postage_type_requested: chitchat_cheapest_postage_type_requested.yes, // from frontend
//           ship_date: payload.ship_date, // need to be from frontend
//      };

//      // Create shipment
//      const shipment = await createShipment(shipmentPayload, uniqueShopIds[0]);
//      return shipment;
// };

export const chitChatShipmentService = {
     createShipment,
     listShipments,
     getShipment,
     deleteShipment,
     buyShipment,
     cancelShipment,
     refundShipment,
     printShipment,
     getShipmentLabel,
     getShipmentTracking,
     // updateShipment,
     // createShipmentFromCart,
};
