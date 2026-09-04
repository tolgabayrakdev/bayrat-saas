import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Yeni parola mevcut paroladan farklı olmalıdır",
    path: ["newPassword"],
  });

export const deleteAccountSchema = z.object({
  currentPassword: z.string().min(1),
});

export const requestEmailChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newEmail: z.string().trim().email().transform((value) => value.toLowerCase()),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type RequestEmailChangeInput = z.infer<typeof requestEmailChangeSchema>;
