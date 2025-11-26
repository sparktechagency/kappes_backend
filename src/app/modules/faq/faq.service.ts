import { StatusCodes } from 'http-status-codes';
import { IFaq } from './faq.interface';
import { Faq } from './faq.model';
import mongoose from 'mongoose';
import AppError from '../../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';

const createFaqToDB = async (payload: IFaq): Promise<IFaq> => {
     const faq = await Faq.create(payload);
     if (!faq) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to created Faq');
     }

     return faq;
};

const faqsFromDB = async (query: any) => {
     // const faqs = await Faq.find(query);
     // return faqs;

     const queryBuilder = new QueryBuilder(Faq.find(), query).paginate().fields().sort().filter();
     const faqs = await queryBuilder.modelQuery.exec();
     const meta = await queryBuilder.countTotal();

     return { faqs, meta };
};

const deleteFaqToDB = async (id: string): Promise<IFaq | undefined> => {
     if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid ID');
     }

     await Faq.findByIdAndDelete(id);
     return;
};

const updateFaqToDB = async (id: string, payload: IFaq): Promise<IFaq> => {
     if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid ID');
     }

     const updatedFaq = await Faq.findByIdAndUpdate({ _id: id }, payload, {
          new: true,
     });
     if (!updatedFaq) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to updated Faq');
     }

     return updatedFaq;
};

export const FaqService = {
     createFaqToDB,
     updateFaqToDB,
     faqsFromDB,
     deleteFaqToDB,
};
