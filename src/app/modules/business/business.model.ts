const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TimeSlotSchema = new Schema({
    start: {
        type: String, // Storing as "HH:MM" string, e.g., "09:00", "13:30"
        required: true,
        // Optional: Add a regex validator for HH:MM format
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    end: {
        type: String, // Storing as "HH:MM" string, e.g., "17:00", "22:00"
        required: true,
        // Optional: Add a regex validator for HH:MM format
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    }
}, { _id: false }); // Set _id to false if you don't need Mongoose to create

// 2. Define the main schema for your entity (e.g., Store, Business)
const BusinessSchema = new Schema({

    // ... other fields for your business


    b_location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true, index: '2dsphere' }, // [longitude, latitude]
    },
    businessHours: {
        monday: {
            type: [TimeSlotSchema], // An array of TimeSlotSchema documents
            default: [] // Default to an empty array if no hours are specified for the day (meaning closed)
        },
        tuesday: {
            type: [TimeSlotSchema],
            default: []
        },
        wednesday: {
            type: [TimeSlotSchema],
            default: []
        },
        thursday: {
            type: [TimeSlotSchema],
            default: []
        },
        friday: {
            type: [TimeSlotSchema],
            default: []
        },
        saturday: {
            type: [TimeSlotSchema],
            default: []
        },
        sunday: {
            type: [TimeSlotSchema],
            default: []
        }
    }
});

const Business = mongoose.model('Business', BusinessSchema);

module.exports = Business;