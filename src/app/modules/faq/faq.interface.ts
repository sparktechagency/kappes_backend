import { Model } from 'mongoose';

export type IFaq = {
     question: string;
     answer: string;
     type: 'for_website' | 'for_seller';
};
export type FaqModel = Model<IFaq>;
