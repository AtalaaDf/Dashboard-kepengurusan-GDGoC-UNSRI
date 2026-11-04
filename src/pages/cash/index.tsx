import React, { useState } from 'react';
import type { KasSubmission } from '@/types';
import { useCash } from './data/use-cash';
import { CashHeaderSection } from './sections/CashHeaderSection';
import { PendingSubmissionsSection } from './sections/PendingSubmissionsSection';
import { ReceiptReviewModalSection } from './sections/ReceiptReviewModalSection';
import { ExpenseModalSection } from './sections/ExpenseModalSection';
import { CashHistorySection } from './sections/CashHistorySection';
import { ANIMATIONS } from '@/lib/animations';

export const CashPage: React.FC = () => {
  const {
    submissions,
    expenses,
    pendingSubmissions,
    currentBalance,
    activeTab,
    setActiveTab,
    errorMessage,
    setErrorMessage,
    canReview,
    approveSubmission,
    declineSubmission,
    addExpense,
    getMemberById,
    getDivisionByMemberId,
    getItemsBySubmissionId,
  } = useCash();

  const [selectedSubmission, setSelectedSubmission] = useState<KasSubmission | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  return (
    <div className={`flex flex-col gap-6 ${ANIMATIONS.PAGE_FADE_IN}`}>
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-[#f8d8d8] text-[#ea4335] text-xs font-medium border border-[#ea4335]/20 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs underline hover:text-[#d93025]"
          >
            Tutup
          </button>
        </div>
      )}

      <CashHeaderSection
        balance={currentBalance}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingSubmissions.length}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        canReview={canReview}
      />

      {activeTab === 'pending' ? (
        <PendingSubmissionsSection
          submissions={pendingSubmissions}
          getMemberById={getMemberById}
          getDivisionByMemberId={getDivisionByMemberId}
          onSelectSubmission={setSelectedSubmission}
        />
      ) : (
        <CashHistorySection
          submissions={submissions}
          expenses={expenses}
          getMemberById={getMemberById}
        />
      )}

      <ReceiptReviewModalSection
        isOpen={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        submission={selectedSubmission}
        items={selectedSubmission ? getItemsBySubmissionId(selectedSubmission.id) : []}
        member={selectedSubmission ? getMemberById(selectedSubmission.member_id) : undefined}
        division={
          selectedSubmission
            ? getDivisionByMemberId(selectedSubmission.member_id)
            : undefined
        }
        onApprove={approveSubmission}
        onDecline={declineSubmission}
      />

      <ExpenseModalSection
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onAddExpense={addExpense}
      />
    </div>
  );
};

