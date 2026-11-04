import React from 'react';
import type { KasSubmission, Member, Division } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Badge } from '@/components/ui/Badge';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface PendingSubmissionsSectionProps {
  submissions: KasSubmission[];
  getMemberById: (id: string) => Member | undefined;
  getDivisionByMemberId: (id: string) => Division | undefined;
  onSelectSubmission: (submission: KasSubmission) => void;
}

export const PendingSubmissionsSection: React.FC<PendingSubmissionsSectionProps> = ({
  submissions,
  getMemberById,
  getDivisionByMemberId,
  onSelectSubmission,
}) => {
  if (submissions.length === 0) {
    return (
      <div className="p-12 text-center border border-[#1e1e1e]/10 rounded-2xl bg-white text-[#1e1e1e]/60 text-sm">
        Belum ada pembayaran yang perlu diperiksa.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {submissions.map((sub) => {
        const member = getMemberById(sub.member_id);
        const division = getDivisionByMemberId(sub.member_id);

        return (
          <div
            key={sub.id}
            onClick={() => onSelectSubmission(sub)}
            className="p-5 rounded-2xl border border-[#1e1e1e]/10 bg-white hover:bg-[#f0f0f0]/50 transition-colors cursor-pointer flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Badge variant="warning">Menunggu Konfirmasi</Badge>
                <span className="text-xs text-[#1e1e1e]/50">
                  {formatDate(sub.submitted_at)}
                </span>
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#1e1e1e]">
                  {member?.full_name || 'Member'}
                </h3>
                <p className="text-xs text-[#1e1e1e]/60">
                  {division?.name || 'Divisi'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1e1e1e]/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#1e1e1e]/60">
                <DocumentTextIcon className="w-4 h-4 text-[#4285f4]" />
                <span>Klik untuk periksa bukti</span>
              </div>
              <span className="text-sm font-semibold text-[#4285f4]">
                {formatCurrency(sub.total_amount)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

