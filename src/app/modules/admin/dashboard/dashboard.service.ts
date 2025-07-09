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

        // Calculate total revenue based on shop's revenue percentage of their sales
        const shopRevenues = await Shop.aggregate([
            {
                $match: {
                    isDeleted: false,
                    revenue: { $gt: 0 } // Only include shops with a revenue percentage
                }
            },
            {
                $lookup: {
                    from: 'orders',
                    let: { shopId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$shop', '$$shopId'] },
                                        { $ne: ['$status', ORDER_STATUS.CANCELLED] },
                                        { $gt: ['$finalAmount', 0] }
                                    ]
                                }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalShopSales: { $sum: '$finalAmount' }
                            }
                        }
                    ],
                    as: 'orders'
                }
            },
            {
                $unwind: {
                    path: '$orders',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    shopId: '$_id',
                    revenuePercentage: '$revenue',
                    totalSales: { $ifNull: ['$orders.totalShopSales', 0] },
                    calculatedRevenue: {
                        $multiply: [
                            { $divide: ['$revenue', 100] }, // Convert percentage to decimal
                            { $ifNull: ['$orders.totalShopSales', 0] } // Total sales
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$calculatedRevenue' },
                    shopRevenues: {
                        $push: {
                            shopId: '$shopId',
                            revenuePercentage: '$revenuePercentage',
                            totalSales: '$totalSales',
                            calculatedRevenue: '$calculatedRevenue'
                        }
                    }
                }
            }
        ]);

        const totalRevenue = shopRevenues.length > 0 ? shopRevenues[0].totalRevenue : 0;

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
            totalSales: Number(totalSales.toFixed(2)),
            totalRevenue: Number(totalRevenue.toFixed(2)),
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