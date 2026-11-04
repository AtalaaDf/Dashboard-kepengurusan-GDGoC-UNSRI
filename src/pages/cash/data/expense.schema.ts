import { z } from 'zod';

export const cashRecordSchema = z.object({
  type: z.enum(['expense', 'income']).default('expense'),
  expense_date: z.string().min(1, { message: 'Tanggal transaksi wajib diisi' }),
  description: z.string().trim().min(1, { message: 'Keterangan transaksi wajib diisi' }),
  amount: z
    .number({ error: 'Nominal harus berupa angka valid' })
    .positive({ message: 'Nominal transaksi harus lebih besar dari 0' }),
});

export const expenseSchema = cashRecordSchema;
export type CashRecordFormData = z.infer<typeof cashRecordSchema>;
export type ExpenseFormData = CashRecordFormData;
