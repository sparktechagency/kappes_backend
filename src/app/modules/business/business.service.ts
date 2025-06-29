import bcrypt from 'bcrypt';
import { IRecentSearchLocation } from "../user/user.interface";
import { User } from "../user/user.model";
import { IBusiness, IBusinessSearchParams } from "./business.interface";
import { Business } from "./business.model";
import AppError from "../../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import generateOTP from "../../../utils/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";
import config from "../../../config";
import { jwtHelper } from "../../../helpers/jwtHelper";
import cryptoToken from "../../../utils/cryptoToken";
import { ResetToken } from "../resetToken/resetToken.model";
import { Secret } from 'jsonwebtoken'
import { IVerifyEmail } from '../../../types/auth';
import { IBusinessMessage } from './business.enums';
import QueryBuilder from '../../builder/QueryBuilder';
import { IJwtPayload } from '../auth/auth.interface';

const createBusiness = async (businessData: IBusiness, user: IJwtPayload): Promise<IBusiness> => {
    // CHECK already any business exists with this email
    const isExistBusiness = await Business.findOne({ email: businessData.email });
    if (isExistBusiness) {
        throw new AppError(StatusCodes.CONFLICT, 'Email already exists');
    }
    const business = await Business.create({
        ...businessData,
        owner: user.id,
    });

    //send email
    const otp = generateOTP(4);
    const values = {
        name: businessData.name,
        otp: otp,
        email: businessData.email!,
    };
    const createAccountTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(createAccountTemplate);

    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + Number(config.otp.otpExpiryTimeInMin) * 60000),
    };
    await Business.findOneAndUpdate({ _id: business._id }, { $set: { authentication } });
    // update owner
    await User.findOneAndUpdate({ _id: user.id }, { $push: { business_informations: business._id } });
    return business;
};


// resend otp
const resendOtpFromDb = async (email: string) => {
    // Check if the user exists
    const isExistBusiness = await Business.findOne({ email });
    if (!isExistBusiness || !isExistBusiness._id) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Business doesn't exist!");
    }

    // send email
    const otp = generateOTP(4);
    const values = {
        name: isExistBusiness.name,
        otp: otp,
        email: isExistBusiness.email!,
    };
    const createAccountTemplate = emailTemplate.createAccount(values);
    emailHelper.sendEmail(createAccountTemplate);

    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 3 * 60000),
    };
    await Business.findOneAndUpdate({ _id: isExistBusiness._id }, { $set: { authentication } });
};


//verify email
const verifyEmailToDB = async (payload: IVerifyEmail) => {
    const { email, oneTimeCode } = payload;
    const isExistBusiness = await Business.findOne({ email }).select('+authentication').lean() as IBusiness & { _id: any; authentication?: { oneTimeCode?: string; expireAt?: Date } };
    if (!isExistBusiness) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Business doesn't exist!");
    }

    if (!oneTimeCode) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Please give the otp, check your email we send a code');
    }

    if (isExistBusiness.authentication?.oneTimeCode !== oneTimeCode) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'You provided wrong otp');
    }

    const date = new Date();
    if (date > isExistBusiness.authentication?.expireAt) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Otp already expired, Please try again');
    }

    let message;
    let verifyToken;
    let accessToken;
    let business;
    if (!isExistBusiness.verified) {
        await Business.findOneAndUpdate({ _id: isExistBusiness._id }, { verified: true, authentication: { oneTimeCode: null, expireAt: null } });
        //create token
        accessToken = jwtHelper.createToken({ id: isExistBusiness._id.toString() as string, role: "", businessType: isExistBusiness.type, email: isExistBusiness.email }, config.jwt.jwt_secret as Secret, config.jwt.jwt_expire_in as string);
        message = 'Email verify successfully';
        business = await Business.findById(isExistBusiness._id);
    } else {
        await Business.findOneAndUpdate(
            { _id: isExistBusiness._id },
            {
                authentication: {
                    oneTimeCode: null,
                    expireAt: null,
                },
            },
        );

        //create token ;
        const createToken = cryptoToken();
        await ResetToken.create({
            user: isExistBusiness._id,
            token: createToken,
            expireAt: new Date(Date.now() + 5 * 60000),
        });
        message = 'Verification Successful: Please securely store and utilize this code for reset password';
        verifyToken = createToken;
    }
    return { verifyToken, message, accessToken, business };
};

const searchBusinesses = async (params: IBusinessSearchParams,
    userId?: string): Promise<IBusiness[]> => {
    const { latitude, longitude, radius, searchByLocationText, ...otherFilters } = params;

    const query: any = { ...otherFilters };

    // Geospatial query
    if (latitude !== undefined && longitude !== undefined && radius !== undefined) {
        query.location = {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                $maxDistance: radius,
            },
        };
    }

    // Text-based location search (if not doing geospatial or as a fallback)
    // This could search across city, province, territory, country fields
    if (searchByLocationText) {
        query.$or = [
            { city: { $regex: searchByLocationText, $options: 'i' } },
            { province: { $regex: searchByLocationText, $options: 'i' } },
            { territory: { $regex: searchByLocationText, $options: 'i' } },
            { country: { $regex: searchByLocationText, $options: 'i' } },
        ];
    }

    // If $or exists but no specific business searchTerm, remove redundant $or
    if (query.$or && query.$or.length === 0) {
        delete query.$or;
    }


    const businesses = await Business.find(query).exec();

    // --- Logic to save recent search ---
    if (userId && (params.latitude || params.searchByLocationText)) {
        const user = await User.findById(userId);
        if (user) {
            const newRecentSearch: IRecentSearchLocation = {
                locationName: params.searchByLocationText || (params.latitude && params.longitude ? `${params.latitude}, ${params.longitude}` : 'Unknown Location'),
                searchDate: new Date(),
            };
            if (params.latitude && params.longitude) {
                newRecentSearch.geoLocation = { type: 'Point', coordinates: [params.longitude, params.latitude] };
            }
            // Optional: You could try to reverse-geocode lat/lng to get city/province names here
            // or pass them from frontend.

            // Add to the front of the array and limit its size (e.g., to 10)
            user.recentSearchLocations = [newRecentSearch, ...(user.recentSearchLocations || [])].slice(0, 10);
            await user.save();
        }
    }
    // --- End save recent search logic ---

    return businesses;
};

const getAllVerifiedBusinesses = async (query: Record<string, unknown>) => {
    const queryBuilder = new QueryBuilder(Business.find({ verified: true }).populate('owner', 'full_name email'), query).paginate().fields().sort().filter();
    const businesses = await queryBuilder.modelQuery.exec();
    const meta = await queryBuilder.countTotal();

    return { businesses, meta };
};

const getAllMessagesOfBusiness = async (id: string, user: IJwtPayload, query: Record<string, unknown>) => {
    const business = await Business.findById(id);
    if (!business) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Business not found');
    }

    if (business.owner.toString() !== user.id) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized to access this business');
    }
    let businessMessages = business.messages;
    // do pagination manually
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;
    businessMessages = businessMessages.slice(skip, skip + limit);
    const meta = {
        page,
        limit,
        total: businessMessages.length,
    };
    return { meta, businessMessages };
};

const sendMessageToBusiness = async (id: string, message: IBusinessMessage) => {
    const business = await Business.findById(id).populate('owner', 'full_name email');
    // senderEmail and business.owner.email same not possibole
    if (!business) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Business not found');
    }
    business.messages.push({ ...message, createdAt: new Date() });
    await business.save();
    return business.messages;
};

const getBusinessDetails = async (id: string) => {
    const business = await Business.findById(id);
    if (!business) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Business not found');
    }
    return business;
};

const deleteBusiness = async (id: string, user: IJwtPayload) => {
    const business = await Business.findById(id);
    if (!business) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Business not found');
    }
    if (business.owner.toString() !== user.id) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized to access this business');
    }
    business.isDeleted = true;
    await business.save();

    // update owner
    await User.findOneAndUpdate({ _id: user.id }, { $pull: { business_informations: business._id } });
    return business;
};

const getAllBusinessesOfUser = async (user: IJwtPayload, query: Record<string, unknown>) => {
    const queryBuilder = new QueryBuilder(Business.find({ owner: user.id }).populate('owner', 'full_name email'), query).paginate().fields().sort().filter();
    const businesses = await queryBuilder.modelQuery.exec();
    const meta = await queryBuilder.countTotal();

    return { businesses, meta };
};

const updateBusiness = async (id: string, payload: IBusiness, user: IJwtPayload) => {
    const business = await Business.findById(id);
    if (!business) {
        throw new AppError(StatusCodes.NOT_FOUND, 'Business not found');
    }
    if (business.owner.toString() !== user.id) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized to access this business');
    }
    business.set(payload);
    await business.save();
    return business;
};

export const BusinessService = {
    createBusiness,
    resendOtpFromDb,
    verifyEmailToDB,
    searchBusinesses,
    getAllVerifiedBusinesses,
    getAllMessagesOfBusiness,
    sendMessageToBusiness,
    getBusinessDetails,
    deleteBusiness,
    getAllBusinessesOfUser,
    updateBusiness
}