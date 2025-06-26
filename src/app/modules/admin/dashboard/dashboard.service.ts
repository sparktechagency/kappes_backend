import { User } from '../../user/user.model'; 

const getRevenue = async () => {

     // Define month names to match the required structure
     const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

     // Initialize the response with zero revenue for all months
     const monthlyRevenue = months.map((month) => ({
          month,
          totalRevenue: 0,
     }));
 
     // Return the result in the desired format
     return {
          success: true,
          message: 'Total revenue analysis retrieved successfully',
          data: monthlyRevenue,
     };
};
const getStatistics = async () => { 
     const totalUsers = await User.countDocuments({ role: 'USER' });
     return { 
          totalUsers,
     };
};
const getResentUsers = async () => {
     const result = await User.find({ role: 'USER' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt phone isSubscribed packageName status');
     return result;
};
export const DashboardService = { getRevenue, getStatistics, getResentUsers };
