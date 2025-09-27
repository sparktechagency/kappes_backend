import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SubscriptionService } from './subscription.service';
import { IJwtPayload } from '../auth/auth.interface';

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const {id,email} = req.user as IJwtPayload;
  const result = await SubscriptionService.createSubscription({
    ...req.body,
    user:id,
    email
  });
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Subscription created successfully',
    data: result,
  });
});

const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await SubscriptionService.getAllSubscriptions(query);
  sendResponse(res, {
    pagination: {
      limit: Number(query.limit) || 10,
      page: Number(query.page) || 1,
      total: result.length,
      totalPage: Math.ceil(result.length / (Number(query.limit) || 10)),
    },

    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscriptions fetched successfully',
    data: result,
  });
});

const getSubscriptionById = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getSubscriptionById(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription fetched successfully',
    data: result,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.updateSubscription(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription updated successfully',
    data: result,
  });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.deleteSubscription(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription deleted successfully',
    data: result,
  });
});

const getMySubscriptions = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionService.getMySubscriptions((req.user as IJwtPayload).id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Subscription fetched successfully',
    data: result,
  });
});


// create checkout session
const createCheckoutSession = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const packageId = req.params.id;
  const result = await SubscriptionService.createSubscriptionCheckoutSession(id, packageId);

  sendResponse(res, {
       statusCode: StatusCodes.OK,
       success: true,
       message: 'Create checkout session successfully',
       data: {
            sessionId: result.sessionId,
            url: result.url,
       },
  });
});


const subscriptionSuccess = catchAsync(async (req, res) => {
  const sessionId = req.query.session_id as string;
  console.log("✅ Subscription success endpoint hit with session ID:", sessionId);
  const session = await SubscriptionService.successMessage(sessionId);
  console.log("✅ Retrieved session details:", JSON.stringify(session, null, 2));
  
  // Check if session is complete and subscription is active
  if (session.status === 'complete' && session.subscription) {
    console.log("🔔 Session is complete and has subscription ID:", session.subscription);
    // Note: The webhook should have already been triggered by Stripe at this point
    // If not, it might be due to network issues or incorrect webhook URL
  }
  
  // Directly send HTML as response
  const htmlResponse = `
    <html>
      <head>
        <title>Subscription Success</title>
      </head>
      <body>
        <h1>Success!</h1>
        <p>Your subscription has been successfully created.</p>
        <p>Session ID: ${sessionId}</p>
        <p>Status: ${session.status}</p>
        <p>Subscription ID: ${session.subscription || 'Not yet available'}</p>
        <p>Customer ID: ${session.customer || 'Not found'}</p>
      </body>
    </html>
  `;
  
  res.send(htmlResponse);
});

// Assuming you have OrderServices imported properly
const subscriptionCancel = catchAsync(async (req, res) => {
  // res.send('Cancel');
  
  // Directly send HTML as response
  const htmlResponse = `
    <html>
      <head>
        <title>Subscription Cancelled</title>
      </head>
      <body>
        <h1>Cancelled!</h1>
        <p>Your subscription has been cancelled.</p>
      </body>
    </html>
  `;
  
  res.send(htmlResponse);
});

export const SubscriptionController = {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  getMySubscriptions,
  createCheckoutSession,
  subscriptionSuccess,
  subscriptionCancel,
};
