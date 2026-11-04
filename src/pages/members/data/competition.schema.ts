import { z } from 'zod';

export const competitionSchema = z.object({
  competition_name: z.string().trim().min(1, { message: 'Nama lomba wajib diisi' }),
  organizer: z.string().trim().min(1, { message: 'Asal penyelenggara wajib diisi' }),
});

export type CompetitionFormData = z.infer<typeof competitionSchema>;

