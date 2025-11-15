import { string, z } from 'zod';
import { USER_ROLES } from './user.enums';
export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, { message: 'Invalid ObjectId' });
export const createUserZodSchema = z.object({
     body: z.object({
          full_name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters long'),
          email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
          password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters long'),
          phone: string().default('').optional(),
          profile: z.string().optional(),
          store_name: z.string().optional(),
          store_category: objectIdSchema.optional(),
     }),
});

const updateUserZodSchema = z.object({
     body: z.object({
          full_name: z.string().optional(),
          phone: z.string().optional(),
          address: z
               .union([
                    z.string(),
                    z.object({
                         province: z.string().optional(),
                         territory: z.string().optional(),
                         city: z.string().optional(),
                         country: z.string().optional(),
                         detail_address: z.string().optional(),
                    }),
               ])
               .optional(),
          email: z.string().email('Invalid email address').optional(),
          password: z.string().optional(),
          image: z.string().optional(),
     }),
});

const updateUserByIdZodSchema = z.object({
     body: z.object({
          role: z.nativeEnum(USER_ROLES).optional(),
          status: z.enum(['active', 'blocked']).optional(),
          verified: z.boolean().optional(),
     }),
});

const makeAdminZodSchema = z.object({
     body: z.object({
          role: z.nativeEnum(USER_ROLES),
          email: z.string().email('Invalid email address'),
          full_name: z.string(),
          password: z.string(),
     })
     .superRefine((data, ctx) => {
          if (data.role !== USER_ROLES.ADMIN) {
               ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `role must be ${USER_ROLES.ADMIN}`,
               });
          }
     }),
});

export type ISellerUserZod = z.infer<typeof createUserZodSchema>;
export const UserValidation = {
     createUserZodSchema,
     updateUserZodSchema,
     updateUserByIdZodSchema,
     makeAdminZodSchema
};
