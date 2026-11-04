import React from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

interface DashboardHeaderSectionProps {
  canReviewCash: boolean;
  pendingCashCount: number;
  batchName: string;
}

export const DashboardHeaderSection: React.FC<DashboardHeaderSectionProps> = ({
  canReviewCash,
  pendingCashCount,
  batchName,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#1e1e1e]/10">
      <div>
        <h1 className="text-2xl font-semibold text-[#1e1e1e]">Dashboard</h1>
        <p className="text-sm text-[#1e1e1e]/60 mt-0.5">
          Ringkasan eksekutif pengelolaan organisasi GDGoC UNSRI &bull; {batchName}
        </p>
      </div>

      {canReviewCash && (
        <Link
          to="/cash"
          className="self-start sm:self-auto flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-[#1e1e1e]/10 bg-white hover:bg-[#f0f0f0] transition-colors"
          title="Pembayaran kas pending"
        >
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-[#1e1e1e]" />
            {pendingCashCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ea4335] rounded-full ring-2 ring-white" />
            )}
          </div>
        </Link>
      )}
    </div>
  );
};

