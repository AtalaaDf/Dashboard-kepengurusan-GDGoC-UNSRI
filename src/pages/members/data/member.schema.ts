import { z } from 'zod';

export const divisionSchema = z.object({
  name: z.string().trim().min(1, { message: 'Nama divisi wajib diisi' }),
  type: z.enum(['technical', 'non_technical'], {
    error: 'Pilih jenis divisi (Technical atau Non-Technical)',
  }),
});

export type DivisionFormData = z.infer<typeof divisionSchema>;

export const memberSchema = z.object({
  full_name: z.string().trim().min(1, { message: 'Nama lengkap member wajib diisi' }),
  division_id: z.string().trim().min(1, { message: 'Divisi wajib dipilih' }),
});

export type MemberFormData = z.infer<typeof memberSchema>;

