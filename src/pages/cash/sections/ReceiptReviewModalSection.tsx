import React, { useState } from 'react';
import type { KasSubmission, KasSubmissionItem, Member, Division } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/formatters';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November'
];

interface ReceiptReviewModalSectionProps {
  isOpen: boolean;
  onClose: () => void;
  submission: KasSubmission | null;
  items: KasSubmissionItem[];
  member: Member | undefined;
  division: Division | undefined;
  onApprove: (id: string) => Promise<boolean>;
  onDecline: (id: string) => Promise<boolean>;
}

export const ReceiptReviewModalSection: React.FC<ReceiptReviewModalSectionProps> = ({
  isOpen,
  onClose,
  submission,
  items,
  member,
  division,
  onApprove,
  onDecline,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!submission) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    const ok = await onApprove(submission.id);
    setIsProcessing(false);
    if (ok) onClose();
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    const ok = await onDecline(submission.id);
    setIsProcessing(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Struk Pembayaran Kas</DialogTitle>
            <Badge className='mr-8' variant="warning">Pending</Badge>
          </div>
          <DialogDescription>
            Dikirim pada {formatDate(submission.submitted_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Detail Member */}
          <div className="p-3.5 rounded-xl border border-[#1e1e1e]/10 bg-[#f0f0f0]/30 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#1e1e1e]/60">Nama Member</span>
              <p className="font-semibold text-sm text-[#1e1e1e] mt-0.5">
                {member?.full_name || '-'}
              </p>
            </div>
            <div>
              <span className="text-[#1e1e1e]/60">Divisi</span>
              <p className="font-semibold text-sm text-[#1e1e1e] mt-0.5">
                {division?.name || '-'}
              </p>
            </div>
          </div>

          {/* Rincian Bulan & Nominal */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#1e1e1e]">Rincian Pembayaran</span>
            <div className="border border-[#1e1e1e]/10 rounded-xl divide-y divide-[#1e1e1e]/10 text-xs">
              {items.map((item) => (
                <div key={item.id} className="p-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#1e1e1e]">
                      Bulan {MONTH_NAMES[item.month - 1] || item.month}
                    </span>
                    <Badge variant={item.kind === 'dues' ? 'info' : 'warning'}>
                      {item.kind === 'dues' ? 'Iuran' : 'Denda'}
                    </Badge>
                  </div>
                  <span className="font-medium text-[#1e1e1e]">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}

              <div className="p-3 bg-[#f0f0f0]/50 flex items-center justify-between font-semibold text-sm">
                <span>Total Transfer</span>
                <span className="text-[#4285f4]">{formatCurrency(submission.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Gambar Bukti Transaksi */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-[#1e1e1e]">Bukti Transaksi</span>
            <div
              onClick={() => setIsZoomed(!isZoomed)}
              className="relative rounded-xl border border-[#1e1e1e]/10 overflow-hidden bg-[#1e1e1e]/5 flex items-center justify-center p-3 cursor-zoom-in"
              title="Klik untuk memperbesar/memperkecil"
            >
              <img
                src={submission.proof_path}
                alt="Bukti Transfer Kas"
                className={`transition-all duration-200 rounded object-contain ${isZoomed ? 'max-h-[380px] w-full' : 'max-h-48'}`}
              />
              <span className="absolute bottom-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded">
                {isZoomed ? 'Klik perkecil' : 'Klik perbesar'}
              </span>
            </div>
          </div>

          {/* Tombol Keputusan Terima / Tolak */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e1e1e]/10">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDecline}
              disabled={isProcessing}
            >
              Tolak
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              {isProcessing ? 'Memproses...' : 'Terima Pembayaran'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
