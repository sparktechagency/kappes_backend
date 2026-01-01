import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';
import { IProvince } from './Province.interface';
import { Province } from './Province.model';
import QueryBuilder from '../../builder/QueryBuilder';
import unlinkFile from '../../../shared/unlinkFile';

const createProvince = async (payload: IProvince): Promise<IProvince> => {
     const result = await Province.create(payload);
     if (!result) {
          if(payload.image){
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'Province not found.');
     }
     return result;
};

const getAllProvinces = async (query: Record<string, any>): Promise<{ meta: { total: number; page: number; limit: number; }; result: IProvince[]; }> => {
     const queryBuilder = new QueryBuilder(Province.find(), query);
     const result = await queryBuilder.filter().sort().paginate().fields().modelQuery;
     const meta = await queryBuilder.countTotal();
     return { meta, result };
};

const getAllUnpaginatedProvinces = async (): Promise<IProvince[]> => {
     const result = await Province.find();
     return result;
};

const updateProvince = async (id: string, payload: Partial<IProvince>): Promise<IProvince | null> => {
     const isExist = await Province.findById(id);
     if (!isExist) {
          if(payload.image){
               unlinkFile(payload.image);
          }
          throw new AppError(StatusCodes.NOT_FOUND, 'Province not found.');
     }

     if(isExist.image){
          unlinkFile(isExist.image);
     }
     return await Province.findByIdAndUpdate(id, payload, { new: true });
};

const deleteProvince = async (id: string): Promise<IProvince | null> => {
     const result = await Province.findById(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Province not found.');
     }
     result.isDeleted = true;
     result.deletedAt = new Date();
     await result.save();
     return result;
};

const hardDeleteProvince = async (id: string): Promise<IProvince | null> => {
     const result = await Province.findByIdAndDelete(id);
     if (!result) {
          throw new AppError(StatusCodes.NOT_FOUND, 'Province not found.');
     }
     if(result.image){
          unlinkFile(result.image);
     }
     return result;
};

const getProvinceById = async (id: string): Promise<IProvince | null> => {
     const result = await Province.findById(id);
     return result;
};   

export const ProvinceService = {
     createProvince,
     getAllProvinces,
     getAllUnpaginatedProvinces,
     updateProvince,
     deleteProvince,
     hardDeleteProvince,
     getProvinceById
};
