import React from 'react';
import type { Division, Member } from '@/types';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { formatCurrency } from '@/lib/formatters';
import { CheckCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { ANIMATIONS } from '@/lib/animations';

interface PublicPaymentFormSectionProps {
  divisions: Division[];
  members: Member[];
  selectedDivisionId: string;
  selectedMemberId: string;
  selectedMonths: number[];
  selectedFineMonths: number[];
  paidOrPendingMonths: number[];
  availableFineMonths: number[];
  totalAmount: number;
  proofPreviewUrl: string | null;
  formError: string | null;
  isSuccess: boolean;
  monthNames: string[];
  onDivisionChange: (id: string) => void;
  onMemberChange: (id: string) => void;
  onToggleMonth: (m: number) => void;
  onToggleFineMonth: (m: number) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export const PublicPaymentFormSection: React.FC<PublicPaymentFormSectionProps> = ({
  divisions,
  members,
  selectedDivisionId,
  selectedMemberId,
  selectedMonths,
  selectedFineMonths,
  paidOrPendingMonths,
  availableFineMonths,
  totalAmount,
  proofPreviewUrl,
  formError,
  isSuccess,
  monthNames,
  onDivisionChange,
  onMemberChange,
  onToggleMonth,
  onToggleFineMonth,
  onFileChange,
  onSubmit,
  onReset,
}) => {
  if (isSuccess) {
    return (
      <div className={`w-full max-w-lg bg-white border border-[#1e1e1e]/10 rounded-2xl p-8 flex flex-col items-center text-center gap-4 ${ANIMATIONS.PAGE_FADE_IN}`}>
        <div className="p-3 bg-[#ccf6c5] text-[#34a853] rounded-full">
          <CheckCircleIcon className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#1e1e1e]">Data berhasil dikirim</h2>
          <p className="text-sm text-[#1e1e1e]/60 mt-1">
            Bukti transfer dan pilihan bulan telah tercatat dengan status pending. Bendahara akan segera memverifikasi pembayaran Anda.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="mt-4"
        >
          Kirim Pembayaran Lain
        </Button>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-lg bg-white border border-[#1e1e1e]/10 rounded-2xl p-6 sm:p-8 ${ANIMATIONS.PAGE_FADE_IN}`}>
      <div className="flex flex-col items-center text-center mb-6">
        <img
          src="/logoGDG.png"
          alt="GDG on Campus"
          className="h-9 w-auto mb-3 object-contain"
        />
        <h1 className="text-2xl font-semibold text-[#1e1e1e] tracking-tight">
          Formulir Pembayaran Kas
        </h1>
        <p className="text-xs text-[#1e1e1e]/60 mt-1">
          GDGoC Universitas Sriwijaya &bull; Periode Januari s.d. November
        </p>
      </div>

      {formError && (
        <div className="mb-5 p-3 rounded-lg bg-[#f8d8d8] text-[#ea4335] text-xs font-medium border border-[#ea4335]/20">
          {formError}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* Langkah 1: Pilih Divisi */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pay-division">1. Pilih Divisi</Label>
          <select
            id="pay-division"
            value={selectedDivisionId}
            onChange={(e) => onDivisionChange(e.target.value)}
            className="min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#1e1e1e]/20 bg-white text-sm text-[#1e1e1e] outline-none focus:ring-2 focus:ring-[#4285f4]/30"
          >
            <option value="">-- Pilih Divisi Anda --</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Langkah 2: Pilih Member */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pay-member">2. Nama Anggota (Member)</Label>
          <select
            id="pay-member"
            value={selectedMemberId}
            onChange={(e) => onMemberChange(e.target.value)}
            disabled={!selectedDivisionId}
            className="min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#1e1e1e]/20 bg-white text-sm text-[#1e1e1e] outline-none focus:ring-2 focus:ring-[#4285f4]/30 disabled:bg-[#f0f0f0]/60 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedDivisionId
                ? '-- Pilih divisi terlebih dahulu --'
                : members.length === 0
                ? '-- Tidak ada member aktif di divisi ini --'
                : '-- Pilih Nama Lengkap Anda --'}
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Langkah 3: Pilihan Bulan Kas */}
        {selectedMemberId && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#1e1e1e]/10">
            <div className="flex items-center justify-between">
              <Label>3. Pilih Bulan Kas (Rp10.000/bulan)</Label>
              <span className="text-[11px] text-[#1e1e1e]/60">
                {selectedMonths.length} bulan dipilih
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {monthNames.map((name, idx) => {
                const monthNum = idx + 1;
                const isPaid = paidOrPendingMonths.includes(monthNum);
                const isChecked = selectedMonths.includes(monthNum);

                return (
                  <button
                    key={monthNum}
                    type="button"
                    onClick={() => onToggleMonth(monthNum)}
                    disabled={isPaid}
                    className={`min-h-[42px] px-3 py-2 rounded-lg border text-xs font-medium text-center transition-colors flex items-center justify-between gap-1 select-none ${
                      isPaid
                        ? 'bg-[#f0f0f0] border-transparent text-[#1e1e1e]/40 cursor-not-allowed'
                        : isChecked
                        ? 'bg-[#c3ecf6] border-[#4285f4] text-[#4285f4]'
                        : 'bg-white border-[#1e1e1e]/20 text-[#1e1e1e] hover:bg-[#f0f0f0]'
                    }`}
                  >
                    <span>{name}</span>
                    {isPaid ? (
                      <span className="text-[10px] text-[#1e1e1e]/50">Lunas/Pending</span>
                    ) : isChecked ? (
                      <span className="text-xs font-bold text-[#4285f4]">&check;</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Langkah 4: Pilihan Denda Keterlambatan */}
        {selectedMemberId && availableFineMonths.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#1e1e1e]/10">
            <div className="flex items-center justify-between">
              <Label>4. Denda Keterlambatan (Rp3.000/bulan)</Label>
              <span className="text-[11px] text-[#ea4335]">
                {selectedFineMonths.length} denda dipilih
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableFineMonths.map((mNum) => {
                const isChecked = selectedFineMonths.includes(mNum);
                return (
                  <button
                    key={mNum}
                    type="button"
                    onClick={() => onToggleFineMonth(mNum)}
                    className={`min-h-[40px] px-3 py-2 rounded-lg border text-xs font-medium text-center transition-colors flex items-center justify-between gap-1 ${
                      isChecked
                        ? 'bg-[#f8d8d8] border-[#ea4335] text-[#ea4335]'
                        : 'bg-white border-[#1e1e1e]/20 text-[#1e1e1e] hover:bg-[#f0f0f0]'
                    }`}
                  >
                    <span>Denda {monthNames[mNum - 1]}</span>
                    {isChecked && <span className="font-bold text-[#ea4335]">&check;</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Langkah 5: Total Nominal Terhitung Otomatis */}
        {selectedMemberId && (
          <div className="p-4 rounded-xl border border-[#4285f4]/20 bg-[#c3ecf6]/30 flex items-center justify-between">
            <span className="text-xs font-medium text-[#1e1e1e]/70">Total Transfer (Terkunci)</span>
            <span className="text-xl font-bold text-[#4285f4]">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        )}

        {/* Langkah 6: Unggah Bukti Transaksi */}
        {selectedMemberId && (
          <div className="flex flex-col gap-2 pt-2 border-t border-[#1e1e1e]/10">
            <Label htmlFor="pay-proof">5. Unggah Bukti Transfer</Label>
            <div className="relative border-2 border-dashed border-[#1e1e1e]/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#4285f4] transition-colors cursor-pointer bg-[#f0f0f0]/30">
              <input
                id="pay-proof"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <ArrowUpTrayIcon className="w-6 h-6 text-[#1e1e1e]/50" />
              <p className="text-xs text-[#1e1e1e]/70 font-medium text-center">
                Pilih atau seret gambar bukti transfer (Maks 2 MB)
              </p>
              {proofPreviewUrl && (
                <div className="mt-2 relative">
                  <img
                    src={proofPreviewUrl}
                    alt="Pratinjau bukti"
                    className="max-h-32 rounded border border-[#1e1e1e]/10 object-contain"
                  />
                  <span className="text-[10px] text-[#34a853] font-medium block text-center mt-1">
                    Gambar terpilih
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tombol Kirim */}
        <Button
          type="submit"
          variant="default"
          className="w-full mt-2 min-h-[46px]"
          disabled={!selectedMemberId || totalAmount === 0}
        >
          Kirim Pembayaran
        </Button>
      </form>
    </div>
  );
};
