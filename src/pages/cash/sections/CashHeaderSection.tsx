import React from 'react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatters';
import { PlusIcon, BanknotesIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { ANIMATIONS } from '@/lib/animations';
import { downloadCashRecap } from '@/lib/recap-generator';

interface CashHeaderSectionProps {
  balance: number;
  activeTab: 'pending' | 'history';
  onTabChange: (tab: 'pending' | 'history') => void;
  pendingCount: number;
  onOpenExpenseModal: () => void;
  canReview: boolean;
}

export const CashHeaderSection: React.FC<CashHeaderSectionProps> = ({
  balance,
  activeTab,
  onTabChange,
  pendingCount,
  onOpenExpenseModal,
  canReview,
}) => {
  return (
    <div className="flex flex-col gap-6 pb-4 border-b border-[#1e1e1e]/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1e1e1e]">Pengelolaan Kas</h1>
          <p className="text-sm text-[#1e1e1e]/60 mt-1">
            Pemeriksaan bukti pembayaran kas dan pencatatan arus pengeluaran
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Kartu Ringkasan Saldo Cepat */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-[#34a853]/20 bg-[#ccf6c5]/40">
            <BanknotesIcon className="w-5 h-5 text-[#34a853]" />
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[#1e1e1e]/60">Total Saldo Kas</span>
              <span className="text-base font-semibold text-[#1e1e1e]">
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          {canReview && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={downloadCashRecap}
                className="flex items-center gap-1.5 text-xs"
                title="Unduh rekap kas organisasi CSV"
              >
                <ArrowDownTrayIcon className="w-4 h-4 text-[#4285f4]" />
                <span>Unduh Rekap</span>
              </Button>

              <Button
                type="button"
                variant="default"
                onClick={onOpenExpenseModal}
                className="flex items-center gap-1.5 text-xs"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Catat Pengeluaran</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="flex items-center gap-2 border-b border-[#1e1e1e]/10">
        <button
          type="button"
          onClick={() => onTabChange('pending')}
          className={cn(
            'flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
            ANIMATIONS.HOVER_TRANSITION,
            activeTab === 'pending'
              ? 'border-[#4285f4] text-[#4285f4]'
              : 'border-transparent text-[#1e1e1e]/60 hover:text-[#1e1e1e]'
          )}
        >
          <span>Pemeriksaan Kas</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#ffe7a5] text-[#1e1e1e]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('history')}
          className={cn(
            'flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
            ANIMATIONS.HOVER_TRANSITION,
            activeTab === 'history'
              ? 'border-[#4285f4] text-[#4285f4]'
              : 'border-transparent text-[#1e1e1e]/60 hover:text-[#1e1e1e]'
          )}
        >
          <span>Riwayat Kas & Pengeluaran</span>
        </button>
      </div>
    </div>
  );
};
