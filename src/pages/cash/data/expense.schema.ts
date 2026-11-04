import { z } from 'zod';

export const expenseSchema = z.object({
  expense_date: z.string().min(1, { message: 'Tanggal pengeluaran wajib diisi' }),
  description: z.string().trim().min(1, { message: 'Keterangan pengeluaran wajib diisi' }),
  amount: z
    .number({ error: 'Nominal harus berupa angka valid' })
    .positive({ message: 'Nominal pengeluaran harus lebih besar dari 0' }),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

