import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import config from '../../../config';
import AppError from '../../../errors/AppError';
import { emailHelper } from '../../../helpers/emailHelper';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import { generateOrderInvoicePDF } from '../../../utils/generateOrderInvoicePDF';
import QueryBuilder from '../../builder/QueryBuilder';
import stripe from '../../config/stripe.config';
import { IJwtPayload } from '../auth/auth.interface';
import { Coupon } from '../coupon/coupon.model';
import { Payment } from '../payment/payment.model';
import { generateTransactionId } from '../payment/payment.utils';
import { Product } from '../product/product.model';
import { Shop } from '../shop/shop.model';
import { USER_ROLES } from '../user/user.enums';
import { User } from '../user/user.model';
import Variant from '../variant/variant.model';
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from './order.enums';
import { IOrder } from './order.interface';
import { Order } from './order.model';
import { transferToVendor } from './order.utils';

const createOrder = async (orderData: Partial<IOrder>, user: IJwtPayload) => {
     try {
          const thisCustomer = await User.findById(user.id);
          if (!thisCustomer || !thisCustomer.stripeCustomerId) {
               throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
          }

          if (orderData.products) {
               for (const item of orderData.products) {
                    // Validate product and variant
                    const [isExistProduct, isExistVariant] = await Promise.all([Product.findOne({ _id: item.product, shopId: orderData.shop }), Variant.findById(item.variant)]);

                    if (!isExistProduct) {
                         throw new AppError(StatusCodes.NOT_FOUND, `Product not found with ID: ${item.product} | products must be from the same shop`);
                    }

                    if (!isExistVariant) {
                         throw new AppError(StatusCodes.NOT_FOUND, `Variant not found with ID: ${item.variant}`);
                    }

                    // Check if the variant exists in the product's variants array and validate quantity
                    const variantIndex = isExistProduct.product_variant_Details.findIndex((itm) => itm.variantId.toString() === item.variant.toString());

                    if (variantIndex === -1) {
                         throw new AppError(StatusCodes.NOT_FOUND, `Variant not found in product with ID: ${item.product}`);
                    }

                    if (isExistProduct.product_variant_Details[variantIndex].variantQuantity < item.quantity) {
                         throw new AppError(StatusCodes.BAD_REQUEST, `Variant quantity is not available in product with ID: ${item.product}`);
                    }

                    // Set the unit price for the order item
                    item.unitPrice = isExistProduct.product_variant_Details[variantIndex].variantPrice;
                    // Decrease the product's variant quantity
                    isExistProduct.product_variant_Details[variantIndex].variantQuantity -= item.quantity;
                    await isExistProduct.save(); // No session required here anymore
               }
          }

          // Handle coupon and update orderData
          if (orderData.coupon) {
               const coupon = await Coupon.findOne({ code: orderData.coupon, shopId: orderData.shop });
               if (coupon) {
                    const currentDate = new Date();

                    // Check if the coupon is within the valid date range
                    if (currentDate < coupon.startDate) {
                         throw new Error(`Coupon ${coupon.code} has not started yet.`);
                    }

                    if (currentDate > coupon.endDate) {
                         throw new Error(`Coupon ${coupon.code} has expired.`);
                    }

                    orderData.coupon = coupon._id as Types.ObjectId;
               } else {
                    throw new Error('Invalid coupon code. and coupon is not available for this shop');
               }
          }

          // Create the order
          const order = new Order({
               ...orderData,
               user: user.id,
          });

          // Validate the order data
          await order.validate();

          let createdOrder;
          if (orderData.paymentMethod === PAYMENT_METHOD.COD) {
               createdOrder = await order.save();

               // const transactionId = generateTransactionId(createdOrder._id.toString());

               // const payment = new Payment({
               //      user: user.id,
               //      shop: createdOrder.shop,
               //      order: createdOrder._id,
               //      method: orderData.paymentMethod,
               //      transactionId,
               //      amount: createdOrder.finalAmount,
               // });

               // createdOrder.payment = payment._id;
               // await createdOrder.save();
               // await payment.save();

               // increase the purchase count of the all the proudcts use operatros
               const updatePurchaseCount = await Product.updateMany({ _id: { $in: createdOrder.products.map((item) => item.product) } }, { $inc: { purchaseCount: 1 } });
               console.log('🚀 ~ createOrder ~ updatePurchaseCount:', updatePurchaseCount);

               // send email to user, notification to shop woner or admins socket
               const shop = await Shop.findById(createdOrder.shop).populate('owner admins');

               const receivers = [...(shop?.admins || []), shop?.owner].map((u: any) => u._id.toString());

               for (const receiverId of receivers) {
                    await sendNotifications({
                         receiver: receiverId,
                         type: 'ORDER',
                         title: `New order placed by test test ${thisCustomer?.full_name}.`,
                         order: createdOrder,
                    });
               }

               // Generate PDF invoice
               const pdfBuffer = await generateOrderInvoicePDF(createdOrder);

               // Prepare email with PDF attachment
               const values = {
                    name: thisCustomer?.full_name,
                    email: thisCustomer.email!,
                    order: createdOrder,
                    attachments: [
                         {
                              filename: `invoice-${createdOrder._id}.pdf`,
                              content: pdfBuffer,
                              contentType: 'application/pdf',
                         },
                    ],
               };

               // Send email with invoice attachment
               const emailTemplateData = emailTemplate.orderInvoice(values);
               emailHelper.sendEmail({
                    ...emailTemplateData,
                    attachments: values.attachments,
               });
          }

          let result;

          if (orderData.paymentMethod !== PAYMENT_METHOD.COD) {
               const stripeCustomer = await stripe.customers.create({
                    name: thisCustomer?.full_name,
                    email: thisCustomer?.email,
               });
               // findbyid and update the user
               await User.findByIdAndUpdate(thisCustomer?.id, { $set: { stripeCustomerId: stripeCustomer.id } });

               const stripeSessionData: any = {
                    payment_method_types: ['card'],
                    mode: 'payment',
                    success_url: config.stripe.success_url,
                    cancel_url: config.stripe.cancel_url,
                    line_items: [
                         {
                              price_data: {
                                   currency: 'usd',
                                   product_data: {
                                        name: 'Amount',
                                        description: `order from ${thisCustomer?.full_name || 'seller'}`,
                                   },
                                   unit_amount: Math.round(order.finalAmount! * 100),
                              },
                              quantity: 1,
                         },
                    ],
                    shipping_address_collection: {
                         allowed_countries: ['US', 'CA', 'GB', 'BD'],
                    },
                    metadata: {
                         products: JSON.stringify(orderData.products), // only array are allowed TO PASS as metadata
                         coupon: orderData.coupon?.toString(),
                         shippingAddress: orderData.shippingAddress,
                         paymentMethod: orderData.paymentMethod,
                         user: user.id,
                         shop: orderData.shop,
                         amount: order.finalAmount,
                    },
               };
               try {
                    const session = await stripe.checkout.sessions.create(stripeSessionData);
                    console.log({
                         url: session.url,
                    });
                    result = { url: session.url };
               } catch (error) {
                    console.log({ error });
               }
          } else {
               result = order;
          }

          // No transaction commit needed anymore
          // Return the result
          return result;
     } catch (error) {
          console.log('🚀 ~ createOrder ~ error:', error);
          // Handle any errors without a session rollback
          throw error;
     }
};

const getMyShopOrders = async (query: Record<string, unknown>, user: IJwtPayload) => {
     const userHasShop = await User.findById(user.id).select('isActive hasShop');

     const shopIsActive = await Shop.findOne({
          owner: userHasShop?.id,
          isActive: true,
     }).select('isActive');

     if (!shopIsActive) throw new AppError(StatusCodes.BAD_REQUEST, 'Shop is not active!');

     const orderQuery = new QueryBuilder(Order.find({ shop: shopIsActive._id }).populate('user products.product coupon'), query)
          .search(['user.name', 'user.email', 'products.product.name'])
          .filter()
          .sort()
          .paginate()
          .fields();

     const result = await orderQuery.modelQuery;

     const meta = await orderQuery.countTotal();

     return {
          meta,
          result,
     };
};

const getOrderDetails = async (orderId: string, user: IJwtPayload) => {
     let order: IOrder | null = null;
     if (user.role === USER_ROLES.USER) {
          order = await Order.findOne({ _id: orderId, user: user.id }).populate('user products.product coupon payment');
          if (!order) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to watch this order');
          }
     } else if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          order = await Order.findOne({ _id: orderId }).populate('user products.product coupon payment');
          if (!order) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Order not Found');
          }

          const productOfShop = await Product.findOne({
               _id: order.products[0].product,
               shopId: order.shop,
          });
          if (!productOfShop) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to watch this order');
          }
     }

     // for admin and super admin allowing them
     if (!order) {
          order = await Order.findById(orderId).populate('user products.product coupon payment');
     }
     if (!order) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Order not Found');
     }
     return order;
};

const getMyOrders = async (query: Record<string, unknown>, user: IJwtPayload) => {
     const orderQuery = new QueryBuilder(Order.find({ user: user.id }).populate('user products.product coupon'), query)
          .search(['user.name', 'user.email', 'products.product.name'])
          .filter()
          .sort()
          .paginate()
          .fields();

     const result = await orderQuery.modelQuery;

     const meta = await orderQuery.countTotal();

     return {
          meta,
          result,
     };
};

const changeOrderStatus = async (orderId: string, status: string, user: IJwtPayload) => {
     // if status to be canclled thne thrwos error metinoong the cancle route
     if (status === ORDER_STATUS.CANCELLED) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Use method: Delete and route: /api/v1/order/cancel/:id to cancel a booking');
     }
     // find order
     const order = await Order.findById(orderId);
     if (!order) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Order not Found');
     }

     // find shop
     const shop = await Shop.findOne({ _id: order.shop, isActive: true }).populate('owner');
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not Found');
     }

     // check verndor or shop admins authorization
     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner._id.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this order');
          }
     }

     switch (order.status) {
          case ORDER_STATUS.PENDING:
               if (status === ORDER_STATUS.PROCESSING) {
                    break;
               }
               throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid order status');
          case ORDER_STATUS.PROCESSING:
               if (status === ORDER_STATUS.COMPLETED) {
                    if (order.paymentStatus === PAYMENT_STATUS.UNPAID) {
                         throw new AppError(StatusCodes.BAD_REQUEST, 'Payment is not done yet. Do the payment first');
                    } else if (order.paymentStatus === PAYMENT_STATUS.PAID) {
                         if (order.paymentMethod !== PAYMENT_METHOD.COD) {
                              if (order.isPaymentTransferdToVendor === false) {
                                   if ((shop!.owner as any).stripeConnectedAccount) {
                                        const transfer = await transferToVendor({
                                             stripeConnectedAccount: (shop.owner as any).stripeConnectedAccount,
                                             finalAmount: order.finalAmount,
                                             revenue: shop.revenue,
                                             orderId: (order._id as string).toString(),
                                        });
                                        console.log('🚀 ~ changeBookingStatus ~ transfer:', transfer);
                                   } else {
                                        throw new AppError(StatusCodes.BAD_REQUEST, 'Stripe account not found');
                                   }
                              }
                         } else {
                              const transactionId = generateTransactionId(order._id.toString());

                              const payment = new Payment({
                                   user: user.id,
                                   shop: order.shop,
                                   order: order._id,
                                   method: order.paymentMethod,
                                   transactionId,
                                   amount: order.finalAmount,
                              });

                              order.payment = payment._id;
                              await order.save();
                              await payment.save();
                         }
                    }
                    break;
               }
               if (status === ORDER_STATUS.CANCELLED) {
                    throw new AppError(StatusCodes.BAD_REQUEST, `Order can't be cancelled by this api use cancelOrder api "/order/:id/cancel"`);
               }
               throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid order status');
          case ORDER_STATUS.COMPLETED:
               throw new AppError(StatusCodes.BAD_REQUEST, "Order status can't be updated");
          default:
               throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid order status');
     }

     const updatedOrder = await Order.findOneAndUpdate({ _id: new Types.ObjectId(orderId), shop: shop._id }, { status }, { new: true });
     return updatedOrder;
};

const getAllRefundOrderRequests = async (query: Record<string, unknown>, user: IJwtPayload, shopId: string) => {
     // find shop
     const shop = await Shop.findOne({ _id: new Types.ObjectId(shopId), isActive: true });
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not Found');
     }

     // check verndor or shop admins authorization
     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this order');
          }
     }
     const queryBuilder = new QueryBuilder(Order.find({ status: 'CANCELLED', isNeedRefund: true, shop: shop._id }), query);
     const orders = await queryBuilder.modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, orders };
};

const cancelOrder = async (orderId: string, user: IJwtPayload) => {
     /**
      * সবার আগে order cancelation validation করব যেমন,
      * প্রথমে আমরা order এর status যদি completed হয় তাহলে আমরা order cancell করতে পারব না
      *  order এর status যদি cancelled হয় তাহলে আমরা order cancell করতে পারব না
      *  order এর paymentStatus যদি paid হয়+order.status:any i.o completed or cancel তাহলে আমরা order cancell করতে পারব তবে সেক্ষেত্রে refund policy maintain করতে হবে
      *  order এর paymentStatus যদি unpaid হয়+order.status:any i.o completed or cancel তাহলে আমরা order cancell করতে পারব
      *
      * order status যদি not completed হয় তাহলে আমরা order cancell করতে পারব তবে ২ বিষয় আছে
      * ১. order payment status যদি unpaid আমরা প্রথমে order এর status কে cancelled করে order এর মধ্যকার প্রতিটি product এর stock কে বাড়ানো হবে এবং আমরা পরে আমরা প্রথমে order এর status কে cancelled হাবে
      * ২. order payment status যদি paid আমরা প্রথমে order এর status কে cancelled করে order এর মধ্যকার প্রতিটি product এর stock কে বাড়ানো হবে এবং আমরা পরে আমরা প্রথমে order এর status কে cancelled হাবে + buyer এর জন্য refund polilciy implement করতে হবে
      * refund policy:
      * 1. প্রথমে আমরা order model এ field বানাবো isNeedRefund নামে তারপর order.paymentStatus:true হলে cancell এর সাথে সাথে এর isNeedRefund:true set করব তারপর তাকে আমরা stripe account create করার জন্য লিংক পাটাব maile এ আর একটা refund me route বানাব(params এ stripe account id নিব) যেখানে কেউ order id দিলে আমরা তার refund validation করে তাকে stripe.transfer করব
      * refund validation policy: order status cancle কিনা, isNeedRefund true কিনা এরপর stripe.transfer করব আর isNeedRefund false করে দিব
      */

     // isExistOder by this user
     const isExistOrder = await Order.findOne({ _id: new Types.ObjectId(orderId) });
     if (!isExistOrder) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
     }

     if (user.role === USER_ROLES.USER) {
          if (isExistOrder.user.toString() !== user.id) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this order');
          }
     }

     if (isExistOrder.status === ORDER_STATUS.COMPLETED || isExistOrder.status === ORDER_STATUS.CANCELLED) {
          throw new AppError(StatusCodes.BAD_REQUEST, `${isExistOrder.status} Order can't be cancelled`);
     }

     // find shop
     const shop = await Shop.findOne({ _id: isExistOrder.shop, isActive: true });
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not Found');
     }

     // check verndor or shop admins authorization
     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this order');
          }
     }

     if (isExistOrder.paymentStatus === PAYMENT_STATUS.PAID) {
          // করা যাবে cancel তবে refund করতে হবে
          if (isExistOrder.isNeedRefund) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Order is already need refund');
          }
          if (isExistOrder.paymentMethod !== PAYMENT_METHOD.COD) {
               await refundOrder(orderId, user);
          } else {
               isExistOrder.status = ORDER_STATUS.CANCELLED;
               isExistOrder.isNeedRefund = true;
               await isExistOrder.save();
               // // if isPaymentTransferdToVendor the refund needs by vendor
               // if (isExistOrder.isPaymentTransferdToVendor) {
               //      return { message: 'Order cancelled successfully but refund needs by vendor cause payment already transferd to vendor', order: isExistOrder };
               // }
          }
     }

     if (isExistOrder.paymentStatus === PAYMENT_STATUS.UNPAID) {
          // ইজিলি করা যাবে cancel
          isExistOrder.status = ORDER_STATUS.CANCELLED;
          await isExistOrder.save();
          // send mail notification for the manager and client
     }

     return { message: 'Order cancelled successfully', order: isExistOrder };
};

const getOrdersByShopId = async (shopId: string, user: IJwtPayload, query: Record<string, unknown>) => {
     // find shop
     const shop = await Shop.findOne({ _id: shopId, isActive: true });
     if (!shop) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Shop not Found');
     }

     // check verndor or shop admins authorization
     if (user.role === USER_ROLES.VENDOR || user.role === USER_ROLES.SHOP_ADMIN) {
          if (shop.owner.toString() !== user.id && !shop.admins?.some((admin) => admin.toString() === user.id)) {
               throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this order');
          }
     }

     const orderQuery = new QueryBuilder(Order.find({ shop: shopId }).populate('user products.product coupon payment'), query)
          .search(['user.name', 'user.email', 'products.product.name'])
          .filter()
          .sort()
          .paginate()
          .fields();

     const orders = await orderQuery.modelQuery;
     const meta = await orderQuery.countTotal();
     return { meta, orders };
};

// const refundOrder = async (orderId: string, user: IJwtPayload) => {
//      try {
//           // Fetch the order with populated payment details
//           const order = await Order.findById(orderId).populate('payment');

//           if (!order) {
//                throw new AppError(StatusCodes.NOT_FOUND, 'Order not found.');
//           }

//           // const payment = await Payment.findOne({ order: orderId, user: user.id, status: { $nin: [PAYMENT_STATUS.UNPAID, PAYMENT_STATUS.REFUNDED], isDeleted: false } });
//           // CORRECTED QUERY - moved isDeleted outside of status
//           const payment = await Payment.findOne({
//                order: orderId,
//                user: user.id,
//                status: { $nin: [PAYMENT_STATUS.UNPAID, PAYMENT_STATUS.REFUNDED] },
//                isDeleted: false, // Now it's a separate condition
//           });
//           if (!payment) {
//                throw new AppError(StatusCodes.BAD_REQUEST, 'Payment for this order is not successful or not found.');
//           }
//           // Check if the order payment is completed
//           if (order.paymentMethod !== PAYMENT_METHOD.COD) {
//                // Refund logic with Stripe
//                const refundAmount = Math.round(payment.amount * 100); // Convert to integer (cents)
//                // Refund logic with Stripe
//                const refund = await stripe.refunds.create({
//                     payment_intent: payment.paymentIntent, // Use the saved paymentIntent
//                     amount: refundAmount, // Refund the full amount (you can modify this if partial refund is needed)
//                });
//                console.log('refund', refund);
//           } else {
//                // Check if the order needs a refund
//                if (!order.isNeedRefund) {
//                     throw new AppError(StatusCodes.BAD_REQUEST, "This order doesn't require a refund.");
//                }
//           }
//           // Update the order's payment status to 'REFUNDED' and save it
//           order.paymentStatus = PAYMENT_STATUS.REFUNDED;
//           order.status = ORDER_STATUS.CANCELLED; // Cancel the order if the refund is successful
//           order.isNeedRefund = false;
//           await order.save();

//           // update payment status to 'REFUNDED'
//           payment.status = PAYMENT_STATUS.REFUNDED;
//           await payment.save();

//           // Respond with success message and refund details
//           return { message: 'Refund processed successfully' };
//      } catch (error) {
//           console.error('Error processing refund:', error);
//           throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error processing refund.');
//      }
// };

const refundOrder = async (orderId: string, user: IJwtPayload) => {
     try {
          // Fetch the order with populated payment details
          const order = await Order.findById(orderId).populate('payment');

          if (!order) {
               throw new AppError(StatusCodes.NOT_FOUND, 'Order not found.');
          }

          const payment = await Payment.findOne({
               order: orderId,
               status: { $nin: [PAYMENT_STATUS.UNPAID, PAYMENT_STATUS.REFUNDED] },
               isDeleted: false,
          });

          if (!payment) {
               throw new AppError(StatusCodes.BAD_REQUEST, 'Payment for this order is not successful or not found.');
          }

          // Check if the order payment is completed
          if (order.paymentMethod !== PAYMENT_METHOD.COD) {
               // Retrieve payment intent from Stripe
               const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentIntent as string);
               console.log('🚀 ~ refundOrder ~ paymentIntent.latest_charge:', paymentIntent.latest_charge);
               console.log('🚀 ~ refundOrder ~ paymentIntent.amount_received:', paymentIntent.amount_received);
               console.log('🚀 ~ refundOrder ~ paymentIntent.application_fee_amount:', paymentIntent.application_fee_amount);
               console.log('🚀 ~ refundOrder ~ paymentIntent.amount_refunded:', paymentIntent.amount_refunded);
               console.log('🚀 ~ refundOrder ~ paymentIntent.amount_details:', paymentIntent.amount_details);
               console.log('🚀 ~ refundOrder ~ paymentIntent:', paymentIntent);

               // Get the latest charge to check refund status
               const chargeId = paymentIntent.latest_charge;
               let availableToRefund;

               if (chargeId) {
                    // Retrieve the charge to get accurate refund information
                    const charge = await stripe.charges.retrieve(chargeId as string);
                    console.log('🚀 ~ refundOrder ~ charge:', {
                         amount: charge.amount,
                         amount_refunded: charge.amount_refunded,
                         refunded: charge.refunded,
                    });

                    availableToRefund = charge.amount - charge.amount_refunded;
               } else {
                    // Fallback to payment intent amounts
                    availableToRefund = paymentIntent.amount_received - (paymentIntent.amount_refunded || 0);
               }

               const requestedRefundAmount = Math.round(payment.amount * 100);

               console.log('🚀 ~ refundOrder ~ amounts:', {
                    requestedRefundAmount,
                    availableToRefund,
                    paymentAmount: payment.amount,
                    amountReceived: paymentIntent.amount_received,
                    amountRefunded: paymentIntent.amount_refunded,
               });

               // Validate refund availability
               if (availableToRefund <= 0) {
                    throw new AppError(StatusCodes.BAD_REQUEST, 'No funds available for refund. This payment may have already been fully refunded.');
               }

               // Check if we can refund the requested amount
               if (requestedRefundAmount > availableToRefund) {
                    throw new AppError(
                         StatusCodes.BAD_REQUEST,
                         `Refund amount mismatch. Database shows $${payment.amount}, but Stripe has $${(availableToRefund / 100).toFixed(2)} available. Please investigate.`,
                    );
               }

               // Process refund using the charge ID if available, otherwise use payment intent
               const refundParams: any = {
                    amount: requestedRefundAmount,
               };

               if (chargeId) {
                    refundParams.charge = chargeId;
               } else {
                    refundParams.payment_intent = payment.paymentIntent;
               }

               const refund = await stripe.refunds.create(refundParams);
               console.log('Refund processed successfully:', refund);
          } else {
               // COD payment logic
               if (!order.isNeedRefund) {
                    throw new AppError(StatusCodes.BAD_REQUEST, "This order doesn't require a refund.");
               }
          }

          // Update order and payment status
          order.paymentStatus = PAYMENT_STATUS.REFUNDED;
          order.status = ORDER_STATUS.CANCELLED;
          order.isNeedRefund = false;
          await order.save();

          payment.status = PAYMENT_STATUS.REFUNDED;
          await payment.save();

          return { message: 'Refund processed successfully' };
     } catch (error) {
          console.error('Error processing refund:', error);

          if (error.type === 'StripeInvalidRequestError') {
               throw new AppError(StatusCodes.BAD_REQUEST, `Payment provider error: ${error.message}`);
          }

          if (error instanceof AppError) {
               throw error;
          }

          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error processing refund.');
     }
};

export const OrderService = {
     createOrder,
     getMyShopOrders,
     getOrderDetails,
     getMyOrders,
     changeOrderStatus,
     cancelOrder,
     getAllRefundOrderRequests,
     getOrdersByShopId,
     refundOrder,
};
