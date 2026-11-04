import { z } from 'zod';

export const eventSchema = z.object({
  name: z.string().trim().min(1, { message: 'Nama event wajib diisi' }),
  event_date: z.string().min(1, { message: 'Tanggal event wajib ditentukan' }),
  type: z.enum(['online', 'offline'], {
    error: 'Pilih tipe event (Online atau Offline)',
  }),
});

export type EventFormData = z.infer<typeof eventSchema>;

