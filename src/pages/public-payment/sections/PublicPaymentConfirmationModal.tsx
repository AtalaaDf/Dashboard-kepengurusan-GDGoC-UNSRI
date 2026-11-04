import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatters';

interface PublicPaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalAmount: number;
  monthsCount: number;
  fineCount: number;
  isSubmitting: boolean;
}

export const PublicPaymentConfirmationModal: React.FC<PublicPaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  monthsCount,
  fineCount,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran Kas</DialogTitle>
          <DialogDescription>
            Data yang diberikan sudah benar?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2 text-xs">
          <div className="p-3 rounded-xl bg-[#f0f0f0]/50 border border-[#1e1e1e]/10 flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-[#1e1e1e]/60">Jumlah Bulan Kas:</span>
              <span className="font-semibold text-[#1e1e1e]">{monthsCount} bulan</span>
            </div>
            {fineCount > 0 && (
              <div className="flex justify-between">
                <span className="text-[#1e1e1e]/60">Jumlah Denda:</span>
                <span className="font-semibold text-[#ea4335]">{fineCount} bulan</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-[#1e1e1e]/10 text-sm">
              <span className="font-semibold text-[#1e1e1e]">Total Nominal:</span>
              <span className="font-semibold text-[#4285f4]">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
          <p className="text-[11px] text-[#1e1e1e]/60">
            Setelah dikonfirmasi, kiriman akan berstatus pending dan diperiksa oleh bendahara organisasi.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e1e1e]/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Lanjut'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

