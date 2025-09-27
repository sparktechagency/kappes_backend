import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { WalletService } from './wallet.service';
import { StatusCodes } from 'http-status-codes';
import { IJwtPayload } from '../auth/auth.interface';

const addToWallet = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.body;

    const { id } = req.user as IJwtPayload;

    const result = await WalletService.addToWallet(id, productId);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Product added to wallet',
        data: result,
    });
});


const getWallet = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.user as IJwtPayload;

    const result = await WalletService.getWallet(id,req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Wallet retrieved successfully',
        data: result,
    });
});

const withDrawFromAvailableBalance = catchAsync(async (req: Request, res: Response) => {
    const { amount } = req.body;

    const { id } = req.user as IJwtPayload;

    const result = await WalletService.withDrawFromAvailableBalance(id, amount);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Withdrawal successful',
        data: result,
    });
});


export const WalletController = {
    addToWallet,
    getWallet,
    withDrawFromAvailableBalance,
};