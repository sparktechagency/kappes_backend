import { model, Schema } from 'mongoose';
import { CONTACT_TYPE, TContact } from './contactus.interface';

const contactSchema = new Schema<TContact>(
     {
          name: {
               type: String,
               required: true,
          },
          email: {
               type: String,
               required: true,
          },
          subject: {
               type: String,
               required: true,
          },
          message: {
               type: String,
               required: true,
          },
          refferenceId: {
               type: Schema.Types.ObjectId,
               required: false, 
          },
          contact_type: {
               type: String,
               enum: ['Shop', 'Business', 'Website'], // IMPORTANT: Defines the allowed models
               required: false,
          },
     },
     {
          timestamps: true,
     },
);



// Virtual for polymorphic population
contactSchema.virtual('target', {
     ref: function () {
          return this.contact_type; // Dynamically uses the value of the 'onModel' field
     },
     localField: 'refferenceId', // The field in this schema that contains the _id
     foreignField: '_id',         // The _id field in the referenced schema
     justOne: true,               // We expect only one document per refferenceId
});

export const Contact = model<TContact>('Contact', contactSchema);
