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
import stripe from "../../../config/stripe";
import config from "../../../config";

const createOrder = async (
    orderData: Partial<IOrder>,
    user: IJwtPayload
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const thisCustomer = await User.findById(user.id);
        if (!thisCustomer || !thisCustomer.stripeCustomerId) {
            throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
        }
        if (orderData.products) {
            for (const item of orderData.products) {
                // Validate product and variant
                const [isExistProduct, isExistVariant] = await Promise.all([
                    Product.findOne({ _id: item.product, shopId: orderData.shop }).session(session),
                    Variant.findById(item.variant).session(session)
                ]);

                if (!isExistProduct) {
                    throw new AppError(StatusCodes.NOT_FOUND, `Product not found with ID: ${item.product}`);
                }

                if (!isExistVariant) {
                    throw new AppError(StatusCodes.NOT_FOUND, `Variant not found with ID: ${item.variant}`);
                }

                // check if ths vairant is in the product.product_variant_Details array if present then check variantQuantity of that item in product.product_variant_Details array
                const variantIndex = isExistProduct.product_variant_Details.findIndex(
                    itm => itm.variantId.toString() === item.variant.toString()
                );

                if (variantIndex === -1) {
                    throw new AppError(StatusCodes.NOT_FOUND, `Variant not found in product with ID: ${item.product}`);
                }

                if (isExistProduct.product_variant_Details[variantIndex].variantQuantity < item.quantity) {
                    throw new AppError(StatusCodes.BAD_REQUEST, `Variant quantity is not available in product with ID: ${item.product}`);
                }

                isExistProduct.product_variant_Details[variantIndex].variantQuantity -= item.quantity;
                await isExistProduct.save({ session });
            }
        }

        // Handle coupon and update orderData
        if (orderData.coupon) {
            const coupon = await Coupon.findOne({ code: orderData.coupon }).session(
                session
            );
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
                throw new Error("Invalid coupon code.");
            }
        }

        // Create the order
        const order = new Order({
            ...orderData,
            user: user.id,
        });

        await order.validate();
        let createdOrder;
        if (orderData.paymentMethod === PAYMENT_METHOD.CASH) {
            createdOrder = await order.save({ session });
            await createdOrder.populate("user products.product");

            const transactionId = generateTransactionId();

            const payment = new Payment({
                user: user.id,
                shop: createdOrder.shop,
                order: createdOrder._id,
                method: orderData.paymentMethod,
                transactionId,
                amount: createdOrder.finalAmount,
            });

            await payment.save({ session });


            // Commit the transaction
            await session.commitTransaction();
            session.endSession();
        }

        let result;

        if (orderData.paymentMethod !== PAYMENT_METHOD.CASH) {
            // need to implement the stripe here if payment method is online/card
            // need to hanlde the stripe like (shop এর যে revenue আছে সেই হিসেবে কিছু টাকা যাবে super admin এর কাছে আর বাকী টাকা যাবে shop owner এর কাছে)

            let stripeCustomerId = thisCustomer?.stripeCustomerId;
            const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);







            await session.commitTransaction();
            session.endSession();
            return {
                url: stripeSession.url,
            };
            // const shop = await Shop.findById(orderData.shop);
            // const superAdmin = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });
            // const shopOwner = await User.findById(shop?.owner);
            // if (!superAdmin || !shopOwner) {
            //     throw new AppError(StatusCodes.BAD_REQUEST, "Super admin or shop owner not found!");
            // }
            // const shopRevenue = shop?.revenue || DEFAULT_SHOP_REVENUE;
            // const superAdminRevenue = createdOrder.finalAmount * (shopRevenue / 100);
            // const shopOwnerRevenue = createdOrder.finalAmount - superAdminRevenue;
            // await User.findByIdAndUpdate(superAdmin._id, { balance: superAdmin.balance + superAdminRevenue });
            // await User.findByIdAndUpdate(shopOwner._id, { balance: shopOwner.balance + shopOwnerRevenue });

        } else {
            result = order;
        }

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // invoice generationand mail sending
        const pdfBuffer = await generateOrderInvoicePDF(createdOrder);
        const emailContent = await emailHelper.createEmailContent(
            //@ts-ignore
            { userName: createdOrder.user.name || "" },
            "orderInvoice"
        );

        const attachment = {
            filename: `Invoice_${createdOrder._id}.pdf`,
            content: pdfBuffer,
            encoding: "base64", // if necessary
        };

        await emailHelper.sendEmail(
            //@ts-ignore
            createdOrder.user.email,
            emailContent,
            "Order confirmed!",
            attachment
        );
        return result;
    } catch (error) {
        console.log(error);
        // Rollback the transaction in case of error
        await session.abortTransaction();
        session.endSession();
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

export const OrderService = {
    createOrder,
    getMyShopOrders,
    getOrderDetails,
    getMyOrders,
    changeOrderStatus,
};
