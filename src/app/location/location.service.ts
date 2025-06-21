
interface ILocationSuggestion {
    city?: string;
    province?: string;
    territory?: string;
    country?: string;
    // Add a display string for the frontend
    display: string;
}

const getSuggestions = async (searchTerm: string): Promise<ILocationSuggestion[]> => {
    // Use aggregation to find distinct city/province/territory names
    // that match the search term.
    // Ensure you have indexes on city, province, territory for performance.

    const pipeline = [
        {
            $match: {
                $or: [
                    { city: { $regex: searchTerm, $options: 'i' } },
                    { province: { $regex: searchTerm, $options: 'i' } },
                    { territory: { $regex: searchTerm, $options: 'i' } },
                ],
            },
        },
        {
            $group: {
                _id: {
                    city: '$city',
                    province: '$province',
                    territory: '$territory',
                    country: '$country',
                },
            },
        },
        {
            $project: {
                _id: 0,
                city: '$_id.city',
                province: '$_id.province',
                territory: '$_id.territory',
                country: '$_id.country',
                display: {
                    $concat: [
                        '$_id.city',
                        { $cond: [{ $ne: ['$_id.province', null] }, ', ', ''], },
                        { $cond: [{ $ne: ['$_id.province', null] }, '$_id.province', ''], },
                        { $cond: [{ $ne: ['$_id.territory', null] }, ', ', ''], },
                        { $cond: [{ $ne: ['$_id.territory', null] }, '$_id.territory', ''], },
                        { $cond: [{ $ne: ['$_id.country', null] }, ', ', ''], },
                        { $cond: [{ $ne: ['$_id.country', null] }, '$_id.country', ''], },
                    ],
                },
            },
        },
        { $limit: 10 }, // Limit suggestions
    ];

    const suggestions = await Business.aggregate(pipeline).exec();

    // Remove duplicates and clean up
    const uniqueSuggestionsMap = new Map<string, ILocationSuggestion>();
    suggestions.forEach((s: any) => {
        // Create a unique key for the map (e.g., "London, Ontario, Canada")
        const key = `${s.city || ''},${s.province || ''},${s.territory || ''},${s.country || ''}`.toLowerCase();
        if (!uniqueSuggestionsMap.has(key)) {
            uniqueSuggestionsMap.set(key, s);
        }
    });

    return Array.from(uniqueSuggestionsMap.values());
};

export const LocationService = {
    getSuggestions,
};