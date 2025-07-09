import { Shop } from "../../shop/shop.model";
import { Order } from "../../order/order.model";
import { Product } from "../../product/product.model";
import { StatusCodes } from "http-status-codes";
import AppError from "../../../../errors/AppError";
import { IJwtPayload } from "../../auth/auth.interface";
import { ORDER_STATUS } from "../../order/order.enums";


const getOverview = async (user: IJwtPayload) => {
    try {
        // Total stores
        const totalStores = await Shop.countDocuments({ isDeleted: false });

        // Total products
        const totalProducts = await Product.countDocuments({ isDeleted: false });

        // Total sales (sum of all orders' finalAmount)
        const totalSalesData = await Order.aggregate([
            { $match: { status: { $ne: ORDER_STATUS.CANCELLED }, finalAmount: { $gt: 0 } } }, // Filter out cancelled or invalid orders
            { $group: { _id: null, totalSales: { $sum: "$finalAmount" } } },
        ]);
        const totalSales = totalSalesData.length > 0 ? totalSalesData[0].totalSales : 0;

        // Total revenue (sum of all shops' revenue)
        const totalRevenueData = await Shop.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: null, totalRevenue: { $sum: "$revenue" } } },
        ]);
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;

        // Data for the Top Categories
        const topCategories = await Product.aggregate([
            { $group: { _id: "$categoryId", totalProducts: { $sum: 1 } } },
            { $sort: { totalProducts: -1 } },
            { $limit: 5 },
        ]);

        // Prepare the response data
        const responseData = {
            totalStores,
            totalProducts,
            totalSales,
            totalRevenue,
            topCategories,
        };

        // Send the response with the data
        return responseData;
    } catch (error: any) {
        console.error("Error fetching overview data:", error);
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Error fetching overview data.", error.message);
    }
};


export const DashboardService = {
    getOverview,
};