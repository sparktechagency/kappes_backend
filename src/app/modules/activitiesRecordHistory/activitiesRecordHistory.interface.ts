export interface IactivitiesRecordHistory {
     image: string;
     title: string;
     description:string;
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IactivitiesRecordHistoryFilters = {
     searchTerm?: string;
};
