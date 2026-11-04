import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { expenseSchema } from '../data/expense.schema';

interface ExpenseModalSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (date: string, description: string, amount: number) => Promise<boolean>;
}

export const ExpenseModalSection: React.FC<ExpenseModalSectionProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dateError, setDateError] = useState<string | undefined>();
  const [descError, setDescError] = useState<string | undefined>();
  const [amountError, setAmountError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setDate('');
    setDescription('');
    setAmountStr('');
    setDateError(undefined);
    setDescError(undefined);
    setAmountError(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(undefined);
    setDescError(undefined);
    setAmountError(undefined);

    const parsedAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;

    const result = expenseSchema.safeParse({
      expense_date: date,
      description,
      amount: parsedAmount,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.expense_date?.[0]) setDateError(fieldErrors.expense_date[0]);
      if (fieldErrors.description?.[0]) setDescError(fieldErrors.description[0]);
      if (fieldErrors.amount?.[0]) setAmountError(fieldErrors.amount[0]);
      return;
    }

    setIsSubmitting(true);
    const success = await onAddExpense(date, description, parsedAmount);
    setIsSubmitting(false);

    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Pengeluaran Kas</DialogTitle>
          <DialogDescription>
            Masukkan rincian pengeluaran dana kas organisasi (langsung mengurangi saldo).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-date">Tanggal Pengeluaran</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (dateError) setDateError(undefined);
              }}
              isError={Boolean(dateError)}
              disabled={isSubmitting}
            />
            {dateError && (
              <p className="text-xs text-[#ea4335]">{dateError}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-desc">Keterangan Pengeluaran</Label>
            <Input
              id="expense-desc"
              placeholder="Contoh: Konsumsi workshop dan sewa proyektor"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descError) setDescError(undefined);
              }}
              isError={Boolean(descError)}
              disabled={isSubmitting}
            />
            {descError && (
              <p className="text-xs text-[#ea4335]">{descError}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="expense-amount">Nominal (Rupiah)</Label>
            <Input
              id="expense-amount"
              type="number"
              placeholder="Contoh: 150000"
              value={amountStr}
              onChange={(e) => {
                setAmountStr(e.target.value);
                if (amountError) setAmountError(undefined);
              }}
              isError={Boolean(amountError)}
              disabled={isSubmitting}
            />
            {amountError && (
              <p className="text-xs text-[#ea4335]">{amountError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#1e1e1e]/10">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

