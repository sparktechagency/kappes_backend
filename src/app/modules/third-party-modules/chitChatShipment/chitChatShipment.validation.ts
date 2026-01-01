import { z } from 'zod';
import {
     chitChatShipment_package_contents,
     chitChatShipment_package_type,
     chitChatShipment_size_unit,
     chitChatShipment_weight_unit,
     chitChatShipment_value_currency,
     chitChatShipment_order_store,
     chitChatShipment_postage_type,
     chitChatShipment_status,
} from './chitChatShipment.enum';

const createChitChatShipmentZodSchema = z.object({
     body: z
          .object({
               shopId: z.string(),
               name: z.string({ required_error: 'Name is required' }),
               address_1: z.string({ required_error: 'Address 1 is required' }),
               address_2: z.string().optional(),
               city: z.string({ required_error: 'City is required' }),
               province_code: z.string().optional(),
               postal_code: z.string().optional(),
               country_code: z.string({ required_error: 'Country code is required' }),
               phone: z.string().optional(),
               email: z.string().optional(),
               return_name: z.string().optional(),
               return_address_1: z.string().optional(),
               return_address_2: z.string().optional(),
               return_city: z.string().optional(),
               return_province_code: z.string().optional(),
               return_phone: z.string().optional(),
               package_contents: z.nativeEnum(chitChatShipment_package_contents).optional(),
               description: z.string().optional(),
               value: z.string({ required_error: 'Value is required' }).optional(),
               value_currency: z.nativeEnum(chitChatShipment_value_currency, { required_error: 'Value currency is required' }).optional(),
               order_id: z.string().optional(),
               order_store: z.nativeEnum(chitChatShipment_order_store).default(chitChatShipment_order_store.other).optional(),
               package_type: z.nativeEnum(chitChatShipment_package_type, { required_error: 'Package type is required' }).optional(),
               weight_unit: z.nativeEnum(chitChatShipment_weight_unit, { required_error: 'Weight unit is required' }).optional(),
               weight: z.number({ required_error: 'Weight is required' }).optional(),
               size_unit: z.nativeEnum(chitChatShipment_size_unit, { required_error: 'Size unit is required' }).optional(),
               size_x: z.number({ required_error: 'Size x is required' }).optional(),
               size_y: z.number({ required_error: 'Size y is required' }).optional(),
               size_z: z.number({ required_error: 'Size z is required' }),
               insurance_requested: z.boolean().optional(),
               signature_requested: z.boolean().optional(),
               vat_reference: z.string().optional(),
               duties_paid_requested: z.boolean().optional(), // * boolean Request duties paid postage for the shipment. Only available for chit_chats_international_tracked postage type. vat_reference must be provided in order to use duties paid postages.
               postage_type: z.nativeEnum(chitChatShipment_postage_type).optional(),
               cheapest_postage_type_requested: z.string().optional(), // * string Value: "yes" Selects the cheapest available rate for a shipment. postage_type must be unknown. Can be customized in your account under Settings > Cheapest Postage Type Option
               tracking_number: z.string().optional(),
               ship_date: z.string().optional(), //* string This is the date Chit Chats is expected to receive your shipment. Accepted values are today or a date in the format of YYYY-MM-DD
               line_items: z
                    .array(
                         // Array of objects Required for US and International shipments. Recommended for all shipments. Line items for the shipment.
                         z.object({
                              quantity: z.number(),
                              description: z.string(),
                              value_amount: z.string(),
                              currency_code: z.string(),
                              hs_tariff_code: z.string(),
                              sku_code: z.string().optional(),
                              origin_country: z.string(),
                              weight: z.number(),
                              weight_unit: z.string(),
                         }),
                    )
                    .optional(),
          })
          .superRefine((data, ctx) => {
               if (data.duties_paid_requested) {
                    if (data.postage_type !== chitChatShipment_postage_type.chit_chats_international_tracked) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'Postage type must be chit_chats_international_tracked',
                         });
                    }
                    if (!data.vat_reference) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'Vat reference is required',
                         });
                    }
               }
               if (data.cheapest_postage_type_requested !== 'yes') {
                    if (data.postage_type !== chitChatShipment_postage_type.unknown) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'Cheapest postage type requested must be yes when postage type is unknown',
                         });
                    }
               }
               if (data.ship_date) {
                    // check format YYYY-MM-DD
                    const date = new Date(data.ship_date);
                    if (date.toISOString().split('T')[0] !== data.ship_date) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'Ship date must be today or a date in the format of YYYY-MM-DD',
                         });
                    }
               }
               if (data.line_items) {
                    if (data.line_items.length === 0) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'Line items is required',
                         });
                    }
               }
          }),
});

const isValidYYYYMMDD = (value: string): boolean => {
     if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

     const [year, month, day] = value.split('-').map(Number);
     const date = new Date(Date.UTC(year, month - 1, day));

     return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

export const ChitChatsCreateShipmentBodySchema = z.object({
     body: z
          .object({
               // Address
               name: z.string(),
               address_1: z.string(),
               city: z.string(),
               province_code: z.string(),
               postal_code: z.string(),
               country_code: z.string(),
               phone: z.string(),

               // product
               weight_unit: z.enum(['g']),
               weight: z.number(), // weight must be sum of line_items weight
               size_unit: z.enum(['cm']),
               // size_x*size_y*size_z >= qube of line items sum
               size_x: z.number(),
               size_y: z.number(),
               size_z: z.number(),

               // Shipment
               package_type: z.enum(['parcel']),
               cheapest_postage_type_requested: z.enum(['yes']),
               ship_date: z
                    .string()
                    .refine(isValidYYYYMMDD, {
                         message: 'ship_date must be in YYYY-MM-DD format',
                    })
                    .refine(
                         (value) => {
                              const [y, m, d] = value.split('-').map(Number);

                              const shipDate = new Date(Date.UTC(y, m - 1, d));

                              const today = new Date();
                              const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

                              return shipDate >= todayUTC;
                         },
                         {
                              message: 'ship_date must be today or a future date',
                         },
                    ),

               // Line items
               line_items: z.array(
                    z.object({
                         // Product
                         quantity: z.number(),
                         description: z.string(),
                         value_amount: z.string(),
                         currency_code: z.string(),
                         hs_tariff_code: z.string(),
                         origin_country: z.string(),
                         weight: z.number(),
                         weight_unit: z.enum(['g']),
                         // Manufacturer
                         manufacturer_contact: z.string(),
                         manufacturer_street: z.string(),
                         manufacturer_city: z.string(),
                         manufacturer_postal_code: z.string(),
                         manufacturer_province_code: z.string(),

                         // unnecessary just to measure the parcel size_x*size_y*size_z >= qube of line items sum
                         chitchats_size_x: z.number().optional(),
                         chitchats_size_y: z.number().optional(),
                         chitchats_size_z: z.number().optional(),
                    }),
               ),
          })
          .superRefine((data, ctx) => {
               /* -----------------------------
       Weight validation
    ----------------------------- */
               const totalItemWeight = data.line_items.reduce((sum, item) => sum + item.weight * item.quantity, 0);

               if (data.weight !== totalItemWeight) {
                    ctx.addIssue({
                         path: ['weight'],
                         message: `Weight must equal sum of line item weights (${totalItemWeight}g)`,
                         code: z.ZodIssueCode.custom,
                    });
               }

               /* -----------------------------
       Volume validation
    ----------------------------- */
               const packageVolume = data.size_x * data.size_y * data.size_z;

               let itemsVolume = 0;

               for (const [index, item] of data.line_items.entries()) {
                    const { chitchats_size_x, chitchats_size_y, chitchats_size_z } = item;

                    if (chitchats_size_x == null || chitchats_size_y == null || chitchats_size_z == null) {
                         ctx.addIssue({
                              path: ['line_items', index],
                              message: 'chitchats_size_x/y/z are required to validate package volume',
                              code: z.ZodIssueCode.custom,
                         });
                         return;
                    }

                    itemsVolume += chitchats_size_x * chitchats_size_y * chitchats_size_z * item.quantity;
               }

               if (packageVolume < itemsVolume) {
                    ctx.addIssue({
                         path: ['size_x', 'size_y', 'size_z'],
                         message: `Package volume (${packageVolume} cm³) must be ≥ total line item volume (${itemsVolume} cm³)`,
                         code: z.ZodIssueCode.custom,
                    });
               }
          }),
});

const getAllChitChatShipmentsZodSchema = z.object({
     query: z.object({
          page: z.string().optional(),
          limit: z.string().optional(),
          batch_id: z.string().optional(),
          package_type: z.string().optional(),
          from_date: z.string().optional(),
          to_date: z.string().optional(),
          q: z.string().optional(), // searchTerm
          status: z.nativeEnum(chitChatShipment_status).optional(),
     }),
     body: z.object({
          shopId: z.string(),
     }),
});

// Schema for getting a single shipment
const getChitChatShipmentZodSchema = z.object({
     params: z.object({
          shipmentId: z.string({ required_error: 'Shipment ID is required' }),
     }),
     body: z.object({
          shopId: z.string(),
     }),
});

// Schema for updating a shipment
const updateChitChatShipmentZodSchema = z.object({
     params: z.object({
          shipmentId: z.string({ required_error: 'Shipment ID is required' }),
     }),
     body: z.object({
          shopId: z.string(),
          name: z.string().optional(),
          address_1: z.string().optional(),
          address_2: z.string().optional(),
          city: z.string().optional(),
          province_code: z.string().optional(),
          postal_code: z.string().optional(),
          country_code: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          description: z.string().optional(),
          value: z.string().optional(),
          value_currency: z.nativeEnum(chitChatShipment_value_currency).optional(),
          size_x: z.number().optional(),
          size_y: z.number().optional(),
          size_z: z.number().optional(),
          insurance_requested: z.boolean().optional(),
          signature_requested: z.boolean().optional(),
          vat_reference: z.string().optional(),
          cheapest_postage_type_requested: z.string().optional(),
          tracking_number: z.string().optional(),
          ship_date: z.string().optional(),
          line_items: z
               .array(
                    z.object({
                         quantity: z.number(),
                         description: z.string(),
                         value_amount: z.string(),
                         currency_code: z.string(),
                         hs_tariff_code: z.string(),
                         sku_code: z.string(),
                         origin_country: z.string(),
                         weight: z.number(),
                         weight_unit: z.string(),
                    }),
               )
               .optional(),
          isDeleted: z.boolean().optional(),
          deletedAt: z.date().optional(),
     }),
});

// Schema for deleting a shipment
const deleteChitChatShipmentZodSchema = z.object({
     params: z.object({
          shipmentId: z.string({ required_error: 'Shipment ID is required' }),
     }),
     body: z.object({
          shopId: z.string(),
     }),
});

// Schema for buying a shipment
const buyChitChatShipmentZodSchema = z.object({
     params: z.object({
          shipmentId: z.string({ required_error: 'Shipment ID is required' }),
     }),
     body: z.object({
          shopId: z.string(),
          postage_type: z.nativeEnum(chitChatShipment_postage_type),
     }),
});

// Schema for canceling a shipment
const cancelChitChatShipmentZodSchema = z.object({
     params: z.object({
          shipmentId: z.string({ required_error: 'Shipment ID is required' }),
     }),
     body: z.object({
          shopId: z.string(),
     }),
});

// Schema for printing a shipment
const printChitChatShipmentZodSchema = z.object({
     params: z.object({
          shipmentId: z.string({ required_error: 'Shipment ID is required' }),
     }),
     body: z.object({
          shopId: z.string(),
     }),
});

// Schema for getting a shipment label
const getChitChatShipmentLabelZodSchema = z.object({
     params: z.object({
          shipmentId: z.string({ required_error: 'Shipment ID is required' }),
     }),
     body: z.object({
          shopId: z.string(),
     }),
});

// Schema for getting shipment tracking
const getChitChatShipmentTrackingZodSchema = z.object({
     params: z.object({
          shipmentId: z.string({ required_error: 'Shipment ID is required' }),
     }),
     body: z.object({
          shopId: z.string(),
     }),
});

const createChitChatShipmentByCartZodSchema = z.object({
     body: z
          .object({
               ship_date: z.string(),
          })
          .superRefine((data, ctx) => {
               if (data.ship_date) {
                    const date = new Date(data.ship_date);
                    if (date.toISOString().split('T')[0] !== data.ship_date || date < new Date()) {
                         ctx.addIssue({
                              code: z.ZodIssueCode.custom,
                              message: 'Ship date must be today or a date in the future in the format of YYYY-MM-DD',
                         });
                    }
               }
          }),
});

const createShippingKeysZodSchema = z.object({
     body: z.object({
          shopId: z.string(),
          chitchats_client_id: z.string(),
          chitchats_access_token: z.string(),
     }),
});

export const chitChatShipmentValidation = {
     createChitChatShipmentZodSchema,
     getAllChitChatShipmentsZodSchema,
     getChitChatShipmentZodSchema,
     updateChitChatShipmentZodSchema,
     deleteChitChatShipmentZodSchema,
     buyChitChatShipmentZodSchema,
     cancelChitChatShipmentZodSchema,
     printChitChatShipmentZodSchema,
     getChitChatShipmentLabelZodSchema,
     getChitChatShipmentTrackingZodSchema,
     createChitChatShipmentByCartZodSchema,
     createShippingKeysZodSchema,
     ChitChatsCreateShipmentBodySchema,
};
