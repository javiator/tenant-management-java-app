import { z } from "zod";

export const propertySchema = z.object({
  id: z.number().int().nonnegative(),
  address: z.string().min(1),
  rent: z.number(),
  maintenance: z.number()
});

export const propertyInputSchema = z.object({
  address: z.string().min(1),
  rent: z.number(),
  maintenance: z.number()
});

export const tenantSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().min(1),
  propertyId: z.number().int().nonnegative(),
  propertyAddress: z.string().nullable().optional(),
  passport: z.string().nullable().optional(),
  passportValidity: z.string().nullable().optional(),
  aadharNo: z.string().nullable().optional(),
  employmentDetails: z.string().nullable().optional(),
  permanentAddress: z.string().nullable().optional(),
  contactNo: z.string().nullable().optional(),
  emergencyContactNo: z.string().nullable().optional(),
  rent: z.number().nullable().optional(),
  security: z.number().nullable().optional(),
  moveInDate: z.string().nullable().optional(),
  contractStartDate: z.string().nullable().optional(),
  contractExpiryDate: z.string().nullable().optional()
});

const nullableString = z.string().min(1).nullable().optional();
const nullableNumber = z.number().nullable().optional();

export const tenantCreateSchema = z.object({
  name: z.string().min(1),
  propertyId: z.number().int().nonnegative(),
  passport: nullableString,
  passportValidity: nullableString,
  aadharNo: nullableString,
  employmentDetails: nullableString,
  permanentAddress: nullableString,
  contactNo: nullableString,
  emergencyContactNo: nullableString,
  rent: nullableNumber,
  security: nullableNumber,
  moveInDate: nullableString,
  contractStartDate: nullableString,
  contractExpiryDate: nullableString
});

export const tenantUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    propertyId: z.number().int().nonnegative().optional(),
    passport: nullableString,
    passportValidity: nullableString,
    aadharNo: nullableString,
    employmentDetails: nullableString,
    permanentAddress: nullableString,
    contactNo: nullableString,
    emergencyContactNo: nullableString,
    rent: nullableNumber,
    security: nullableNumber,
    moveInDate: nullableString,
    contractStartDate: nullableString,
    contractExpiryDate: nullableString
  })
  .refine(
    (payload) => Object.values(payload).some((value) => value !== undefined),
    {
      message: "Provide at least one property to update."
    }
  );

export const transactionSchema = z.object({
  id: z.number().int().nonnegative(),
  propertyId: z.number().int().nonnegative(),
  propertyAddress: z.string().nullable().optional(),
  tenantId: z.number().int().nonnegative().nullable().optional(),
  tenantName: z.string().nullable().optional(),
  type: z.string().min(1),
  forMonth: z.string().nullable().optional(),
  amount: z.number(),
  transactionDate: z.string().min(1),
  comments: z.string().nullable().optional()
});

export const transactionCreateSchema = z.object({
  propertyId: z.number().int().nonnegative(),
  tenantId: z.number().int().nonnegative().nullable().optional(),
  type: z.string().min(1),
  forMonth: z.string().nullable().optional(),
  amount: z.number(),
  transactionDate: z.string().min(1),
  comments: z.string().nullable().optional()
});

export const transactionUpdateSchema = z
  .object({
    propertyId: z.number().int().nonnegative().optional(),
    tenantId: z.number().int().nonnegative().nullable().optional(),
    type: z.string().min(1).optional(),
    forMonth: z.string().nullable().optional(),
    amount: z.number().optional(),
    transactionDate: z.string().min(1).optional(),
    comments: z.string().nullable().optional()
  })
  .refine(
    (payload) => Object.values(payload).some((value) => value !== undefined),
    {
      message: "Provide at least one property to update."
    }
  );

export const propertyListSchema = z.array(propertySchema);
export const tenantListSchema = z.array(tenantSchema);
export const transactionListSchema = z.array(transactionSchema);

export type Property = z.infer<typeof propertySchema>;
export type PropertyInput = z.infer<typeof propertyInputSchema>;
export type Tenant = z.infer<typeof tenantSchema>;
export type TenantCreateInput = z.infer<typeof tenantCreateSchema>;
export type TenantUpdateInput = z.infer<typeof tenantUpdateSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>;
