// import { Shop } from '../../shop/shop.model';
// import { Order } from '../../order/order.model';
// import { Product } from '../../product/product.model';
// import { StatusCodes } from 'http-status-codes';
// import AppError from '../../../../errors/AppError';
// import { IJwtPayload } from '../../auth/auth.interface';
// import { ORDER_STATUS } from '../../order/order.enums';

// const getOverview = async (user: IJwtPayload) => {
//      console.log("🚀 ~ getOverview ~ whoAmI?:", user.role)
//      try {
//           // Total stores
//           const totalStores = await Shop.countDocuments({ isDeleted: false });

//           // Total products
//           const totalProducts = await Product.countDocuments({ isDeleted: false });

//           // Total sales (sum of all orders' finalAmount)
//           const totalSalesData = await Order.aggregate([
//                { $match: { status: { $ne: ORDER_STATUS.CANCELLED }, finalAmount: { $gt: 0 } } }, // Filter out cancelled or invalid orders
//                { $group: { _id: null, totalSales: { $sum: '$finalAmount' } } },
//           ]);
//           const totalSales = totalSalesData.length > 0 ? totalSalesData[0].totalSales : 0;

//           // Calculate total revenue based on shop's revenue percentage of their sales
//           const shopRevenues = await Shop.aggregate([
//                {
//                     $match: {
//                          isDeleted: false,
//                          revenue: { $gt: 0 }, // Only include shops with a revenue percentage
//                     },
//                },
//                {
//                     $lookup: {
//                          from: 'orders',
//                          let: { shopId: '$_id' },
//                          pipeline: [
//                               {
//                                    $match: {
//                                         $expr: {
//                                              $and: [{ $eq: ['$shop', '$$shopId'] }, { $ne: ['$status', ORDER_STATUS.CANCELLED] }, { $gt: ['$finalAmount', 0] }],
//                                         },
//                                    },
//                               },
//                               {
//                                    $group: {
//                                         _id: null,
//                                         totalShopSales: { $sum: '$finalAmount' },
//                                    },
//                               },
//                          ],
//                          as: 'orders',
//                     },
//                },
//                {
//                     $unwind: {
//                          path: '$orders',
//                          preserveNullAndEmptyArrays: true,
//                     },
//                },
//                {
//                     $project: {
//                          shopId: '$_id',
//                          revenuePercentage: '$revenue',
//                          totalSales: { $ifNull: ['$orders.totalShopSales', 0] },
//                          calculatedRevenue: {
//                               $multiply: [
//                                    { $divide: ['$revenue', 100] }, // Convert percentage to decimal
//                                    { $ifNull: ['$orders.totalShopSales', 0] }, // Total sales
//                               ],
//                          },
//                     },
//                },
//                {
//                     $group: {
//                          _id: null,
//                          totalRevenue: { $sum: '$calculatedRevenue' },
//                          shopRevenues: {
//                               $push: {
//                                    shopId: '$shopId',
//                                    revenuePercentage: '$revenuePercentage',
//                                    totalSales: '$totalSales',
//                                    calculatedRevenue: '$calculatedRevenue',
//                               },
//                          },
//                     },
//                },
//           ]);

//           const totalRevenue = shopRevenues.length > 0 ? shopRevenues[0].totalRevenue : 0;

//           // Data for the Top Categories
//           // const topCategories = await Product.aggregate([
//           //     { $group: { _id: "$categoryId", totalProducts: { $sum: 1 } } },
//           //     { $sort: { totalProducts: -1 } },
//           //     { $limit: 5 },
//           // ]);

//           const topCategories = await Product.aggregate([
//                // Group products by categoryId and count the total number of products per category
//                {
//                     $group: {
//                          _id: '$categoryId',
//                          totalProducts: { $sum: 1 },
//                     },
//                },
//                // Join with the Category collection to get the category name
//                {
//                     $lookup: {
//                          from: 'categories', // The name of the Category collection (change if it's different)
//                          localField: '_id', // Field from the grouped result (_id from categoryId in Product)
//                          foreignField: '_id', // Field from Category collection to join with (_id)
//                          as: 'categoryInfo', // The alias for the joined data
//                     },
//                },
//                // Unwind the categoryInfo array (since it's a single object, it'll flatten it)
//                {
//                     $unwind: '$categoryInfo',
//                },
//                // Sort the categories by the total number of products (descending)
//                {
//                     $sort: { totalProducts: -1 },
//                },
//                // Limit to the top 5 categories
//                {
//                     $limit: 5,
//                },
//                // Project the final result, including category name and total products
//                {
//                     $project: {
//                          categoryId: '$_id', // Retain the categoryId
//                          categoryName: '$categoryInfo.name', // Extract category name from the joined data
//                          totalProducts: 1, // Keep the total products count
//                          _id: 0, // Remove the original _id field
//                     },
//                },
//           ]);

//           // Prepare the response data
//           const responseData = {
//                totalStores,
//                totalProducts,
//                totalSales: Number(totalSales.toFixed(2)),
//                totalRevenue: Number(totalRevenue.toFixed(2)),
//                topCategories,
//           };

//           // Send the response with the data
//           return responseData;
//      } catch (error: any) {
//           console.error('Error fetching overview data:', error);
//           throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching overview data.', error.message);
//      }
// };

// export const DashboardService = {
//      getOverview,
// };






import { Shop } from '../../shop/shop.model';
import { Order } from '../../order/order.model';
import { Product } from '../../product/product.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../../errors/AppError';
import { IJwtPayload } from '../../auth/auth.interface';
import { ORDER_STATUS } from '../../order/order.enums';

export const getTimeRange = (range: string) => {
     switch (range) {
          case 'today':
               return {
                    startDate: new Date(new Date().setHours(0, 0, 0, 0)),
                    endDate: new Date(new Date().setHours(23, 59, 59, 999)),
               }
          case 'week':
               return {
                    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
                    endDate: new Date(),
               }
          case 'month':
               return {
                    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
                    endDate: new Date(),
               }
          default:
               return {
                    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
                    endDate: new Date(),
               }
     }
}

const getOverview = async (user: IJwtPayload) => {
     console.log("🚀 ~ getOverview ~ whoAmI?:", user.role)
     try {
          // Total stores
          const totalStores = await Shop.countDocuments({ isDeleted: false });

          // Total products
          const totalProducts = await Product.countDocuments({ isDeleted: false });

          // Total sales (sum of all orders' finalAmount)
          const totalSalesData = await Order.aggregate([
               { $match: { status: { $ne: ORDER_STATUS.CANCELLED }, finalAmount: { $gt: 0 } } }, // Filter out cancelled or invalid orders
               { $group: { _id: null, totalSales: { $sum: '$finalAmount' } } },
          ]);
          const totalSales = totalSalesData.length > 0 ? totalSalesData[0].totalSales : 0;

          // Total orders count
          const totalOrdersCount = await Order.countDocuments({ status: { $ne: ORDER_STATUS.CANCELLED } });

          // Calculate total revenue based on shop's revenue percentage of their sales
          const shopRevenues = await Shop.aggregate([
               {
                    $match: {
                         isDeleted: false,
                         revenue: { $gt: 0 }, // Only include shops with a revenue percentage
                    },
               },
               {
                    $lookup: {
                         from: 'orders',
                         let: { shopId: '$_id' },
                         pipeline: [
                              {
                                   $match: {
                                        $expr: {
                                             $and: [{ $eq: ['$shop', '$$shopId'] }, { $ne: ['$status', ORDER_STATUS.CANCELLED] }, { $gt: ['$finalAmount', 0] }],
                                        },
                                   },
                              },
                              {
                                   $group: {
                                        _id: null,
                                        totalShopSales: { $sum: '$finalAmount' },
                                   },
                              },
                         ],
                         as: 'orders',
                    },
               },
               {
                    $unwind: {
                         path: '$orders',
                         preserveNullAndEmptyArrays: true,
                    },
               },
               {
                    $project: {
                         shopId: '$_id',
                         revenuePercentage: '$revenue',
                         totalSales: { $ifNull: ['$orders.totalShopSales', 0] },
                         calculatedRevenue: {
                              $multiply: [
                                   { $divide: ['$revenue', 100] }, // Convert percentage to decimal
                                   { $ifNull: ['$orders.totalShopSales', 0] }, // Total sales
                              ],
                         },
                    },
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
                                   calculatedRevenue: '$calculatedRevenue',
                              },
                         },
                    },
               },
          ]);

          const totalRevenue = shopRevenues.length > 0 ? shopRevenues[0].totalRevenue : 0;

          // Total orders amount
          const totalOrdersAmountData = await Order.aggregate([
               { $match: { status: { $ne: ORDER_STATUS.CANCELLED } } },
               { $group: { _id: null, totalOrdersAmount: { $sum: '$finalAmount' } } },
          ]);
          const totalOrdersAmount = totalOrdersAmountData.length > 0 ? totalOrdersAmountData[0].totalOrdersAmount : 0;

          // Status wise order count
          const statusWiseOrdersCount = await Order.aggregate([
               {
                    $group: {
                         _id: '$status',
                         count: { $sum: 1 },
                    },
               },
          ]);

          // Order growth based on week, month, year
          const { startDate: weekStartDate, endDate: weekEndDate } = getTimeRange('week');
          const weekOrderGrowthData = await Order.aggregate([
               { $match: { createdAt: { $gte: weekStartDate, $lte: weekEndDate }, status: { $ne: ORDER_STATUS.CANCELLED } } },
               { $group: { _id: null, totalWeekSales: { $sum: '$finalAmount' } } },
          ]);
          const weekOrderGrowth = weekOrderGrowthData.length > 0 ? weekOrderGrowthData[0].totalWeekSales : 0;

          const { startDate: monthStartDate, endDate: monthEndDate } = getTimeRange('month');
          const monthOrderGrowthData = await Order.aggregate([
               { $match: { createdAt: { $gte: monthStartDate, $lte: monthEndDate }, status: { $ne: ORDER_STATUS.CANCELLED } } },
               { $group: { _id: null, totalMonthSales: { $sum: '$finalAmount' } } },
          ]);
          const monthOrderGrowth = monthOrderGrowthData.length > 0 ? monthOrderGrowthData[0].totalMonthSales : 0;

          const { startDate: yearStartDate, endDate: yearEndDate } = getTimeRange('year');
          const yearOrderGrowthData = await Order.aggregate([
               { $match: { createdAt: { $gte: yearStartDate, $lte: yearEndDate }, status: { $ne: ORDER_STATUS.CANCELLED } } },
               { $group: { _id: null, totalYearSales: { $sum: '$finalAmount' } } },
          ]);
          const yearOrderGrowth = yearOrderGrowthData.length > 0 ? yearOrderGrowthData[0].totalYearSales : 0;

          // Data for the Top Categories
          const topCategories = await Product.aggregate([
               // Group products by categoryId and count the total number of products per category
               {
                    $group: {
                         _id: '$categoryId',
                         totalProducts: { $sum: 1 },
                    },
               },
               // Join with the Category collection to get the category name
               {
                    $lookup: {
                         from: 'categories', // The name of the Category collection (change if it's different)
                         localField: '_id', // Field from the grouped result (_id from categoryId in Product)
                         foreignField: '_id', // Field from Category collection to join with (_id)
                         as: 'categoryInfo', // The alias for the joined data
                    },
               },
               // Unwind the categoryInfo array (since it's a single object, it'll flatten it)
               {
                    $unwind: '$categoryInfo',
               },
               // Sort the categories by the total number of products (descending)
               {
                    $sort: { totalProducts: -1 },
               },
               // Limit to the top 5 categories
               {
                    $limit: 5,
               },
               // Project the final result, including category name and total products
               {
                    $project: {
                         categoryId: '$_id', // Retain the categoryId
                         categoryName: '$categoryInfo.name', // Extract category name from the joined data
                         totalProducts: 1, // Keep the total products count
                         _id: 0, // Remove the original _id field
                    },
               },
          ]);

          // Prepare the response data
          const responseData = {
               totalStores,
               totalProducts,
               totalOrdersCount,
               totalOrdersAmount,
               statusWiseOrdersCount,
               weekOrderGrowth,
               monthOrderGrowth,
               yearOrderGrowth,
               totalSales: Number(totalSales.toFixed(2)),
               totalRevenue: Number(totalRevenue.toFixed(2)),
               topCategories,
          };

          // Send the response with the data
          return responseData;
     } catch (error: any) {
          console.error('Error fetching overview data:', error);
          throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching overview data.', error.message);
     }
};

export const DashboardService = {
     getOverview,
};
