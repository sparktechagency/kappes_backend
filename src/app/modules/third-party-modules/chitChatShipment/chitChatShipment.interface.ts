export interface IchitChatShipment {
     createdAt: Date;
     updatedAt: Date;
     isDeleted: boolean;
     deletedAt?: Date;
}

export type IchitChatShipmentFilters = {
     searchTerm?: string;
};
