export interface IVendorFilter {
     searchTerm?: string;
     province?: string;
     territory?: string;
     city?: string;
     page?: number;
     limit?: number;
}

export interface IVendorStats {
     totalStore: number;
     totalActiveStore: number;
     totalInactiveStore: number;
     newJoinedStore: number;
}

export interface IStoreStats {
     totalOrders: number;
     totalEarnings: number;
}

export interface IProductFilter {
     searchTerm?: string;
     page?: number;
     limit?: number;
     shopId: string;
}
