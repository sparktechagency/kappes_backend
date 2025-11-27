import { IPayment } from './payment.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import mongoose from 'mongoose';
import { Payment } from './payment.model';

// Create court
const createPaymentService = async (payload: IPayment) => {
  const result = await Payment.create(payload);
  return result;
};

const getAllPaymentByUserId = async (
  userId: string,
  role: string,
  query: Record<string, unknown>,
) => {
  console.log(userId);

  let filter;

  const year = query.year as number;
  const month = query.month as number;

  const page = query.page ? parseInt(query.page as string) : 1; // Default to page 1 if not provided
  const limit = query.limit ? parseInt(query.limit as string) : 10; // Default to limit 10 if not provided
  const skip = (page - 1) * limit;

  if (role === 'admin') {
    filter = {};
  } else if (role === 'business') {
    filter = { businessOwnerId: userId };
  } else {
    filter = { userId };
  }

  if (year) {
    const startOfYear = new Date(`${year}-01-01T00:00:00Z`);
    const endOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00Z`);
    filter = {
      ...filter,
      createdAt: {
        $gte: startOfYear, // Greater than or equal to January 1st of the given year
        $lt: endOfYear, // Less than January 1st of the next year
      },
    };

    console.log('Start of Year:', startOfYear);
    console.log('End of Year:', endOfYear);
  }

  if (month) {
    const adjustedMonth = month - 1;
    const startOfMonth = new Date(Date.UTC(year, adjustedMonth, 1)); // Start of the month
    const endOfMonth = new Date(Date.UTC(year, adjustedMonth + 1, 1));
    filter = {
      ...filter,
      createdAt: {
        $gte: startOfMonth, // Greater than or equal to the 1st day of the specified month
        $lt: endOfMonth, // Less than the 1st day of the next month
      },
      isDeleted: false,
    };

    console.log('Start of Year:', startOfMonth);
    console.log('End of Year:', endOfMonth);
  }

  // Log the filter to debug the constructed query
  console.log('Filter:', filter);

  const result = await Payment.find(filter)
    .populate('bookingId parkingId')
    .skip(skip)
    .limit(limit);

  const total = await Payment.countDocuments(filter);

  const totalPages = Math.ceil(total / limit);

  const meta = {
    page: page,
    limit: limit,
    total: total,
    totalPage: totalPages,
  };

  return { meta, result };
};

const getAllPaymentByOwnerIdService = async (ownerId: string) => {
  const payments = await Payment.aggregate([
    {
      $lookup: {
        from: 'fields',
        localField: 'fieldId',
        foreignField: '_id',
        as: 'field',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'customerId',
        foreignField: '_id',
        as: 'customer',
      },
    },
    {
      $unwind: '$customer',
    },
    {
      $lookup: {
        from: 'courtbookings',
        localField: 'bookingId',
        foreignField: '_id',
        as: 'bookings',
      },
    },
    {
      $unwind: '$bookings',
    },
    {
      $lookup: {
        from: 'fields',
        localField: 'fieldId',
        foreignField: '_id',
        as: 'field',
      },
    },
    {
      $unwind: '$field',
    },
    {
      $lookup: {
        from: 'courts',
        localField: 'courtId',
        foreignField: '_id',
        as: 'court',
      },
    },
    {
      $unwind: '$court',
    },
    {
      $match: { 'field.ownerId': new mongoose.Types.ObjectId(ownerId) },
    },
  ]);

  return payments;
};

const getLast12MonthsEarningsService = async (
  userId: mongoose.Types.ObjectId,
  role: string,
) => {
  // Get the current date
  const currentDate = new Date();

  // Calculate the date 12 months ago from the current date
  const startOfLast12Months = new Date(currentDate);
  startOfLast12Months.setMonth(currentDate.getMonth() - 12);

  const filter: any = {
    createdAt: { $gte: startOfLast12Months, $lte: currentDate },
  };

  // Apply the business owner filter based on the role
  if (role === 'business') {
    filter.businessOwnerId = new mongoose.Types.ObjectId(userId);
  }

  // Perform the aggregation to get the earnings for each month
  const result = await Payment.aggregate([
    {
      $match: filter, // Match payments within the last 12 months
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // Group by month
        totalEarnings: { $sum: { $toDouble: '$totalPrice' } }, // Sum earnings for each month
        adminRevenue: { $sum: { $toDouble: '$adminRevenue' } }, // Sum admin revenue for each month
      },
    },
    {
      $project: {
        month: '$_id', // Keep the month number
        earnings:
          role === 'business'
            ? { $subtract: ['$totalEarnings', '$adminRevenue'] } // Business role: totalPrice - adminRevenue
            : '$adminRevenue', // Non-business role: adminRevenue
      },
    },
    {
      $sort: { _id: 1 }, // Sort by month (ascending order)
    },
  ]);

  // Mapping month numbers to month names
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  // Create an empty array with 12 months, all having 0 earnings initially
  const earnings = months.map((month) => ({
    month,
    earning: 0,
  }));

  // Add the data from the result to the earnings array
  result.forEach((item) => {
    const monthIndex = item.month - 1; // Subtract 1 to match array index
    if (monthIndex >= 0 && monthIndex < 12) {
      earnings[monthIndex].earning = item.earnings || 0;
    }
  });

  // Get the current month index (0-based)
  const currentMonthIndex = new Date().getMonth() + 1; // 0 for Jan, 11 for Dec

  // Create an array with the months in reverse order starting from the current month
  const monthsInReverse = [
    ...months.slice(currentMonthIndex),
    ...months.slice(0, currentMonthIndex),
  ];

  // Reorder the earnings array accordingly
  const reorderedEarnings = monthsInReverse.map((month, index) => {
    return {
      month,
      earning: earnings[(currentMonthIndex + index) % 12].earning,
    };
  });

  return reorderedEarnings;
};

const getLast7DaysEarnings = async (
  userId: mongoose.Types.ObjectId,
  role: string,
) => {
  // Get the current date
  const currentDate = new Date();

  // Calculate the date 7 days ago from the current date
  const startOfLast7Days = new Date(currentDate);
  startOfLast7Days.setDate(currentDate.getDate() - 7);

  const filter: any = {
    createdAt: { $gte: startOfLast7Days, $lte: currentDate },
  };

  // Apply the business owner filter based on the role
  if (role === 'business') {
    filter.businessOwnerId = new mongoose.Types.ObjectId(userId);
  }

  // Perform the aggregation to get the total earnings for the last 7 days
  const result = await Payment.aggregate([
    {
      $match: filter, // Match payments within the last 7 days
    },
    {
      $group: {
        _id: null, // Group all results together
        totalEarnings: { $sum: { $toDouble: '$totalPrice' } }, // Sum of earnings for the last 7 days
      },
    },
  ]);

  // If there's no result, return 0 earnings
  if (result.length === 0) {
    return { totalEarnings: 0 };
  }

  // Return the total earnings
  return { totalEarnings: result[0].totalEarnings || 0 };
};

const getAllPaymentByAdminService = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder(Payment.find({isDeleted: false}).select('method status transactionId createdAt isDeleted'), query);
  const payments = await queryBuilder.fields().filter().paginate().search(['name', 'email', 'phone']).sort().modelQuery.exec();
  const meta = await queryBuilder.countTotal();
  return {
    meta,
    payments,
  };
};  

const getPaymentDetailByAdminByIdService = async (id: string) => {
  const result = await Payment.findById(id,{isDeleted: false}).populate([
    {
      path: 'user',
      select: 'full_name email phone',
    },
    {
      path: 'shop',
      select: 'name email phone',
    },
  ]).select('-gatewayResponse -__v').exec();
  return result;
};

const deletePaymentDetailByAdminByIdService = async (id: string) => {
  // do soft delete
  const result = await Payment.findOneAndUpdate({_id: id,isDeleted: false}, { isDeleted: true },{new: true}).exec();
  if (!result) {
    throw new Error('Payment not found');
  }
  return result;
};

export const paymentService = {
  createPaymentService,
  getAllPaymentByUserId,
  getAllPaymentByOwnerIdService,
  getLast12MonthsEarningsService,
  getLast7DaysEarnings,
  getAllPaymentByAdminService,
  getPaymentDetailByAdminByIdService,
  deletePaymentDetailByAdminByIdService
};
