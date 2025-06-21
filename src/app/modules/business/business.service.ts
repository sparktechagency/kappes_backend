import { IRecentSearchLocation } from "../user/user.interface";
import { User } from "../user/user.model";
import { IBusiness, IBusinessSearchParams } from "./business.interface";

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