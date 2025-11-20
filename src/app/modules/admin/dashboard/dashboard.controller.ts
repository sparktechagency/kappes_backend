import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { IJwtPayload } from '../../auth/auth.interface';
import { DashboardService } from './dashboard.service';
import pick from '../../../../shared/pick';

export const getOverview = catchAsync(async (req: Request, res: Response) => {
     const user = req.user as IJwtPayload;
     const result = await DashboardService.getOverview(user);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Overview retrieved successfully',
          data: result,
     });
});

export const getOrderStats = catchAsync(async (req: Request, res: Response) => {
     const year = req.query.year ? parseInt(req.query.year as string) : undefined;

     const result = await DashboardService.getOrderStatsByYear(year);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Order statistics retrieved successfully',
          data: result,
     });
});

export const getRevenueStats = catchAsync(async (req: Request, res: Response) => {
     const year = req.query.year ? parseInt(req.query.year as string) : undefined;

     const result = await DashboardService.getRevenueStatsByYear(year);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Revenue statistics retrieved successfully',
          data: result,
     });
});

const getVendorList = catchAsync(async (req: Request, res: Response) => {
     const filters = pick(req.query, ['searchTerm', 'province', 'territory', 'city', 'page', 'limit']);
     const result = await DashboardService.getVendorList(filters);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Vendor list retrieved successfully',
          data: result.vendors,
          pagination: result.pagination,
     });
});

const toggleVendorStatus = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DashboardService.toggleVendorStatus(id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Vendor status updated successfully',
          data: result,
     });
});

const updateVendor = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DashboardService.updateVendor(id, req.body);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Vendor updated successfully',
          data: result,
     });
});

const deleteVendor = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DashboardService.deleteVendor(id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Vendor deleted successfully',
          data: result,
     });
});

const getVendorStats = catchAsync(async (req: Request, res: Response) => {
     const result = await DashboardService.getVendorStats();

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Vendor stats retrieved successfully',
          data: result,
     });
});

const getStoreDetails = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DashboardService.getStoreDetails(id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Store details retrieved successfully',
          data: result,
     });
});

const getStoreStats = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DashboardService.getStoreStats(id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Store stats retrieved successfully',
          data: result,
     });
});

const getStoreProducts = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const filters = pick(req.query, ['searchTerm', 'page', 'limit']);
     const result = await DashboardService.getStoreProducts({ ...filters, shopId: id });

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Store products retrieved successfully',
          data: result.products,
          pagination: result.pagination,
     });
});

const createProduct = catchAsync(async (req: Request, res: Response) => {
     const result = await DashboardService.createProduct(req.body);

     sendResponse(res, {
          statusCode: StatusCodes.CREATED,
          success: true,
          message: 'Product created successfully',
          data: result,
     });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DashboardService.updateProduct(id, req.body);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Product updated successfully',
          data: result,
     });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
     const { id } = req.params;
     const result = await DashboardService.deleteProduct(id);

     sendResponse(res, {
          statusCode: StatusCodes.OK,
          success: true,
          message: 'Product deleted successfully',
          data: result,
     });
});

export const DashboardController = {
     getOverview,
     getOrderStats,
     getRevenueStats,
     getVendorList,
     toggleVendorStatus,
     updateVendor,
     deleteVendor,
     getVendorStats,
     getStoreDetails,
     getStoreStats,
     getStoreProducts,
     createProduct,
     updateProduct,
     deleteProduct,
};
