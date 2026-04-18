import { z } from "zod";

export const RegisterRequestSchema = z.object({
  email: z.string().nullable(),
  phoneNumber: z.string(),
  password: z.string(),
  firstName: z.string(),
  secondName: z.string(),
  thirdName: z.string(),
  lastName: z.string(),
  nationalId: z.string(),
  organizationName: z.string().nullable(),
  nationalIdType: z.any(),
  address: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
  clientType: z.any(),
  city: z.string().nullable(),
  parentClientId: z.string().uuid().nullable(),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const ClientUpdateRequestSchema = z.object({
  nationalId: z.string().nullable(),
  firstName: z.string().nullable(),
  secondName: z.string().nullable(),
  thirdName: z.string().nullable(),
  lastName: z.string().nullable(),
  parentClientId: z.string().uuid().nullable(),
  email: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  profilePictureUrl: z.string().nullable(),
  nationalIdType: z.any(),
  organizationName: z.string().nullable(),
});
export type ClientUpdateRequest = z.infer<typeof ClientUpdateRequestSchema>;

