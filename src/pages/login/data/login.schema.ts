import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email wajib diisi' })
    .email({ message: 'Format email tidak valid' }),
  password: z
    .string()
    .min(1, { message: 'Kata sandi wajib diisi' })
    .min(6, { message: 'Kata sandi minimal 6 karakter' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

