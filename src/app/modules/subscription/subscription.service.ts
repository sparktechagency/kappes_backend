import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { Subscription } from './subscription.model';
import { ISubscription } from './subscription.interface';
import { User } from '../user/user.model';
import { Package } from '../package/package.model';
import stripe from '../../../config/stripe';
import config from '../../../config';

const createSubscription = async (
  payload: ISubscription
): Promise<ISubscription> => {
  const result = await Subscription.create(payload);
  if (!result) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Failed to create subscription!'
    );
  }
  return result;
};

const cancelSubscription = async (userId: string): Promise<any> => {
  // Find the active subscription
  const activeSubscription = await Subscription.findOne({
    user: userId,
    status: 'active',
  });
  const isExistUser = await User.findById(userId);
  if (!activeSubscription || !isExistUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No active subscription found');
  }

  try {
    const canceled = await stripe.subscriptions.cancel(
      activeSubscription.subscriptionId
    );
    if (canceled.status !== 'canceled') {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Failed to cancel subscription'
      );
    }
    const deletedSubscription = await Subscription.findByIdAndDelete(
      activeSubscription._id
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isSubscribed: false },
      { new: true }
    );
    return {
      deletedSubscription,
      updatedUser,
      canceled,
    };
  } catch (error) {
    console.log(error);
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to cancel subscription'
    );
  }
};

const getAllSubscriptions = async (
  queryFields: Record<string, any>
): Promise<ISubscription[]> => {
  const { search, page, limit } = queryFields;
  const query = search
    ? {
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { status: { $regex: search, $options: 'i' } },
        ],
      }
    : {};
  let queryBuilder = Subscription.find(query);

  if (page && limit) {
    queryBuilder = queryBuilder.skip((page - 1) * limit).limit(limit);
  } else {
    queryBuilder = queryBuilder.skip(0).limit(10);
  }
  delete queryFields.search;
  delete queryFields.page;
  delete queryFields.limit;
  queryBuilder.find(queryFields);
  return await queryBuilder;
};

const getSubscriptionById = async (
  id: string
): Promise<ISubscription | null> => {
  const result = await Subscription.findById(id);
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription not found!');
  }
  return result;
};

const updateSubscription = async (
  id: string,
  payload: ISubscription
): Promise<ISubscription | null> => {
  const isExistSubscription = await getSubscriptionById(id);
  if (!isExistSubscription) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription not found!');
  }

  const result = await Subscription.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Failed to update subscription!'
    );
  }
  return result;
};

const deleteSubscription = async (
  id: string
): Promise<ISubscription | null> => {
  const isExistSubscription = await getSubscriptionById(id);
  if (!isExistSubscription) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription not found!');
  }

  const result = await Subscription.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Failed to delete subscription!'
    );
  }
  return result;
};

const getMySubscriptions = async (userId: string): Promise<ISubscription[]> => {
  const result = await Subscription.find({ user: userId });
  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Subscription not found!');
  }
  return result;
};

const createSubscriptionCheckoutSession = async (userId: string, packageId: string) => {
  console.log("🔄 Creating subscription checkout session for user:", userId, "and package:", packageId);
  const isExistPackage = await Package.findById(packageId);
  console.log("📦 Package lookup result:", isExistPackage ? isExistPackage._id : "Not found");
  if (!isExistPackage) {
       throw new AppError(StatusCodes.NOT_FOUND, 'Package not found');
  }
  const user = await User.findById(userId).select('+stripeCustomerId');
  console.log("👤 User lookup result:", user ? user._id : "Not found", "Stripe Customer ID:", user?.stripeCustomerId);
  if (!user || !user.stripeCustomerId) {
       throw new AppError(StatusCodes.NOT_FOUND, 'User or Stripe Customer ID not found');
  }

  // Convert Mongoose String types to primitive strings
  console.log("💳 Creating Stripe checkout session with customer:", String(user.stripeCustomerId), "price:", String(isExistPackage.priceId));
  const session = await stripe.checkout.sessions.create({
       mode: 'subscription',
       customer: String(user.stripeCustomerId),
       line_items: [
            {
                 price: String(isExistPackage.priceId),
                 quantity: 1,
            },
       ],
       metadata: {
            userId: String(userId),
            subscriptionId: String(isExistPackage._id),
       },
       // ${config.frontend_url}
       success_url: `http://${config.ip_address}:${config.port}/api/v1/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
       cancel_url: `http://${config.ip_address}:${config.port}/subscription/cancel`,
  });
  console.log("✅ Stripe checkout session created:", session.id, "URL:", session.url);
  return {
       url: session.url,
       sessionId: session.id,
  };
};


const successMessage = async (id: string) => {
  console.log("🔄 Retrieving checkout session:", id);
  const session = await stripe.checkout.sessions.retrieve(id);
  console.log("✅ Retrieved checkout session:", JSON.stringify(session, null, 2));
  return session;
};

export const SubscriptionService = {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  getMySubscriptions,
  createSubscriptionCheckoutSession,
  successMessage,
};
