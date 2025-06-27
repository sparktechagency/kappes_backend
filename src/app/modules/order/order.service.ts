import mongoose, { Types } from "mongoose";
import { IJwtPayload } from "../auth/auth.interface";
import { Coupon } from "../coupon/coupon.model";
import { IOrder } from "./order.interface";
import { Order } from "./order.model";
import { Product } from "../product/product.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { generateTransactionId } from "../payment/payment.utils";
import { Payment } from "../payment/payment.model";
import { generateOrderInvoicePDF } from "../../../utils/generateOrderInvoicePDF";
import { emailHelper } from "../../../helpers/emailHelper";
import { User } from "../user/user.model";
import AppError from "../../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { Shop } from "../shop/shop.model";
import Variant from "../variant/variant.model";
import { PAYMENT_METHOD } from "./order.enums";
import { USER_ROLES } from "../user/user.enums";
import { DEFAULT_SHOP_REVENUE } from "../shop/shop.enum";
// import stripe from "../../../config/stripe";
import config from "../../../config";
import stripe from "../../config/stripe.config";


const createOrder = async (
    orderData: Partial<IOrder>,
    user: IJwtPayload
) => {
    try {
        const thisCustomer = await User.findById(user.id);
        if (!thisCustomer || !thisCustomer.stripeCustomerId) {
            throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
        }

        if (orderData.products) {
            for (const item of orderData.products) {
                // Validate product and variant
                const [isExistProduct, isExistVariant] = await Promise.all([
                    Product.findOne({ _id: item.product, shopId: orderData.shop }),
                    Variant.findById(item.variant)
                ]);

                if (!isExistProduct) {
                    throw new AppError(StatusCodes.NOT_FOUND, `Product not found with ID: ${item.product} | products must be from the same shop`);
                }

                if (!isExistVariant) {
                    throw new AppError(StatusCodes.NOT_FOUND, `Variant not found with ID: ${item.variant}`);
                }

                // Check if the variant exists in the product's variants array and validate quantity
                const variantIndex = isExistProduct.product_variant_Details.findIndex(
                    itm => itm.variantId.toString() === item.variant.toString()
                );

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
                await isExistProduct.save();  // No session required here anymore
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
                throw new Error("Invalid coupon code. and coupon is not available for this shop");
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

            const transactionId = generateTransactionId();

            const payment = new Payment({
                user: user.id,
                shop: createdOrder.shop,
                order: createdOrder._id,
                method: orderData.paymentMethod,
                transactionId,
                amount: createdOrder.finalAmount,
            });

            await payment.save();

            // increase the purchase count of the all the proudcts use operatros
            const updatePurchaseCount = await Product.updateMany(
                { _id: { $in: createdOrder.products.map((item) => item.product) } },
                { $inc: { purchaseCount: 1 } }
            );
            console.log(updatePurchaseCount);

            // Proceed with generating invoice, sending email, etc.
            // Commit logic is not required anymore as no session is being used

        }

        let result;

        if (orderData.paymentMethod !== PAYMENT_METHOD.COD) {
            let stripeCustomer = await stripe.customers.create({
                name: thisCustomer?.full_name,
                email: thisCustomer?.email,
            });
            // findbyid and update the user
            await User.findByIdAndUpdate(thisCustomer?.id, { $set: { stripeCustomerId: stripeCustomer.id } });
            const stripeSessionData: any = {
                payment_method_types: ['card'],
                mode: 'payment',
                customer: stripeCustomer.id,
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'Amount',
                            },
                            unit_amount: order.finalAmount! * 100,  // Convert to cents
                        },
                        quantity: 1,
                    },
                ],
                metadata: {
                    products: JSON.stringify(orderData.products), // only array are allowed TO PASS as metadata
                    coupon: orderData.coupon?.toString(),
                    shippingAddress: orderData.shippingAddress,
                    paymentMethod: orderData.paymentMethod,
                    user: user.id,
                    shop: orderData.shop,
                    amount: order.finalAmount,
                },
                success_url: config.stripe.success_url,
                cancel_url: config.stripe.cancel_url,
            }
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
        console.log(error);
        // Handle any errors without a session rollback
        throw error;
    }
};


const getMyShopOrders = async (
    query: Record<string, unknown>,
    user: IJwtPayload
) => {
    const userHasShop = await User.findById(user.id).select(
        "isActive hasShop"
    );

    const shopIsActive = await Shop.findOne({
        owner: userHasShop?.id,
        isActive: true,
    }).select("isActive");

    if (!shopIsActive)
        throw new AppError(StatusCodes.BAD_REQUEST, "Shop is not active!");

    const orderQuery = new QueryBuilder(
        Order.find({ shop: shopIsActive._id }).populate(
            "user products.product coupon"
        ),
        query
    )
        .search(["user.name", "user.email", "products.product.name"])
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

const getOrderDetails = async (orderId: string) => {
    const order = await Order.findById(orderId).populate(
        "user products.product coupon"
    );
    if (!order) {
        throw new AppError(StatusCodes.NOT_FOUND, "Order not Found");
    }

    order.payment = await Payment.findOne({ order: order._id });
    return order;
};

const getMyOrders = async (
    query: Record<string, unknown>,
    user: IJwtPayload
) => {
    const orderQuery = new QueryBuilder(
        Order.find({ user: user.id }).populate(
            "user products.product coupon"
        ),
        query
    )
        .search(["user.name", "user.email", "products.product.name"])
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

const changeOrderStatus = async (
    orderId: string,
    status: string,
    user: IJwtPayload
) => {
    const userHasShop = await User.findById(user.id).select(
        "isActive hasShop"
    );


    const shopIsActive = await Shop.findOne({
        owner: userHasShop?.id,
        isActive: true,
    }).select("isActive");

    if (!shopIsActive)
        throw new AppError(StatusCodes.BAD_REQUEST, "Shop is not active!");

    const order = await Order.findOneAndUpdate(
        { _id: new Types.ObjectId(orderId), shop: shopIsActive._id },
        { status },
        { new: true }
    );
    return order;
};

const cancelOrder = async (
    orderId: string,
    user: IJwtPayload
) => {
    /**
     * order status যদি not completed হয় তাহলে আমরা order cancell করতে পারব তবে ২ বিষয় আছে
     * ১. order payment status যদি unpaid আমরা প্রথমে order এর status কে cancelled করে order এর মধ্যকার প্রতিটি product এর stock কে বাড়ানো হবে এবং আমরা পরে আমরা প্রথমে order এর status কে cancelled হাবে
     * ২. order payment status যদি paid আমরা প্রথমে order এর status কে cancelled করে order এর মধ্যকার প্রতিটি product এর stock কে বাড়ানো হবে এবং আমরা পরে আমরা প্রথমে order এর status কে cancelled হাবে + buyer এর জন্য refund polilciy implement করতে হবে
     * refund policy:
     * 1. প্রথমে আমরা order model এ field বানাবো isRefunded নামে তারপর cancell এর সাথে সাথে এর value false set করব তারপর তাকে আমরা stripe account create করার জন্য লিংক পাটাব maile এ আর একটা refund me route বানাব(params এ stripe account id নিব) যেখানে কেউ order id দিলে আমরা তার refund validation করে তাকে stripe.transfer করব
     * refund validation policy: order status cancle কিনা, isRefunded false কিনা এরপর stripe.transfer করব আর isRefunded true করে দিব
     */

    const order = await Order.findOneAndUpdate(
        { _id: new Types.ObjectId(orderId), user: user.id },
        { status: "cancelled" },
        { new: true }
    );
    return { message: "Order cancelled service under progress", order };
};

const refundOrderRequest = async (
    orderId: string,
    user: IJwtPayload
) => {
    const order = await Order.findOneAndUpdate(
        { _id: new Types.ObjectId(orderId), user: user.id },
        { status: "cancelled" },
        { new: true }
    );
    return { message: "Order cancelled service under progress", order };
};

export const OrderService = {
    createOrder,
    getMyShopOrders,
    getOrderDetails,
    getMyOrders,
    changeOrderStatus,
    cancelOrder,
    refundOrderRequest 
};
