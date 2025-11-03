Here's the API flow for the Chit Chats shipping integration, following the order creation process:

### 1. Get Shipping Rates (During Checkout)
**Route:** `POST /api/chitchats/rates`
- **When:** When customer is checking out and needs shipping options
- **What it does:** 
  - Validates the shipment request
  - Returns available shipping rates from Chit Chats
  - Stores the shipment in memory (with rates) and returns a `shipmentId`
- **Request Body:**
  ```json
  {
    "to": { /* recipient address */ },
    "from": { /* sender address */ },
    "package_type": "parcel",
    "weight_unit": "kg",
    "weight": 1.5,
    "size_unit": "cm",
    "size_x": 20,
    "size_y": 15,
    "size_z": 10,
    "value": "50.00",
    "value_currency": "USD"
  }
  ```

### 2. Create Order (Your Existing Order Flow)
**Route:** `POST /api/orders`
- **When:** After customer selects shipping method and confirms order
- **What to include:**
  - Store the selected `shipmentId` from step 1 with the order
  - Store the selected shipping rate details
  - Set order status to something like "awaiting_shipment"

### 3. Buy Shipping Label (When Ready to Ship)
**Route:** `POST /api/chitchats/buy/:shipmentId`
- **When:** When merchant is ready to ship the order
- **What it does:**
  - Purchases the selected shipping label
  - Updates the order with tracking information
  - Returns label URL and tracking details
- **Request Body:**
  ```json
  {
    "postage_type": "chit_chats_canada_tracked" // or selected rate's postage type
  }
  ```

### 4. Get Shipping Label (Optional - If Needed Later)
**Route:** `GET /api/chitchats/label/:shipmentId`
- **When:** When you need to re-download the shipping label
- **Returns:** The shipping label URL or file

### 5. Track Shipment (Customer/Admin View)
**Route:** `GET /api/chitchats/track/:publicId`
- **When:** When customer or admin wants to check shipping status
- **Returns:** Current tracking information

### 6. Create Return (If Needed)
**Route:** `POST /api/chitchats/return`
- **When:** When processing a return request
- **Request Body:** Similar to create shipment but with from/to reversed

### 7. Request Refund (If Needed)
**Route:** `PATCH /api/chitchats/refund/:shipmentId`
- **When:** If you need to void/refund an unused label

### Integration Points with Your Order Flow:
1. **During Checkout:**
   - Call `/api/chitchats/rates` to get shipping options
   - Show rates to customer
   - Store selected rate ID with the order

2. **After Payment:**
   - Create order with status "awaiting_fulfillment"
   - Store `shipmentId` with the order

3. **When Fulfilling Order:**
   - Call `/api/chitchats/buy/:shipmentId` to purchase label
   - Update order status to "fulfilled" or "shipped"
   - Store tracking info with the order
   - Send shipping confirmation to customer with tracking info

4. **Post-Shipment:**
   - Use tracking endpoint to show status
   - Handle returns/refunds as needed

Would you like me to elaborate on any specific part of this flow or show example requests/responses for any endpoint?