export enum PackageName {
     STARTER = 'STARTER',
     GROWTH = 'GROWTH',
     PREMIUM = 'PREMIUM',
}
export enum PackageAllowedProductsCount {
     STARTER = 20,
     GROWTH = 100,
     PREMIUM = 1000000,
}

export enum PackageCommission {
     STARTER = 8,
     GROWTH = 3,
     PREMIUM = 0,
}

export enum PackageDuration {
     MONTHLY = '1 month',
     QUARTERLY = '3 months',
     HALF_YEARLY = '6 months',
     YEARLY = '1 year',
}

// isIncludedBlackFriday
export const PackageBlackFriday: Record<PackageName, boolean> = {
     STARTER: false,
     GROWTH: false,
     PREMIUM: true,
};

// isIncludedPromos
export const PackagePromos: Record<PackageName, boolean> = {
     STARTER: false,
     GROWTH: false,
     PREMIUM: true,
};

// isIncludedRoadshow
export const PackageRoadshow: Record<PackageName, boolean> = {
     STARTER: false,
     GROWTH: false,
     PREMIUM: true,
};
