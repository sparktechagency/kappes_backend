export interface IProvince {
     image: string[];
     title: string;
     description: string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IProvinceFilters = {
     searchTerm?: string;
};
