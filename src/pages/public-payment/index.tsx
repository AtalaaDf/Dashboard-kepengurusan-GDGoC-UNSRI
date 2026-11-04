import React from 'react';
import { usePublicPayment } from './data/use-public-payment';
import { PublicPaymentFormSection } from './sections/PublicPaymentFormSection';
import { PublicPaymentConfirmationModal } from './sections/PublicPaymentConfirmationModal';
import { FloatingOrnaments } from '@/components/common/FloatingOrnaments';
import { Footer } from '@/components/layout/Footer';

export const PublicPaymentPage: React.FC = () => {
  const {
    divisions,
    filteredMembers,
    selectedDivisionId,
    selectedMemberId,
    selectedMonths,
    selectedFineMonths,
    paidOrPendingMonths,
    availableFineMonths,
    totalAmount,
    proofPreviewUrl,
    isConfirmOpen,
    isSuccess,
    formError,
    isSubmitting,
    monthNames,
    handleDivisionChange,
    handleMemberChange,
    toggleMonth,
    toggleFineMonth,
    handleFileChange,
    handlePreSubmit,
    handleConfirmSubmit,
    setIsConfirmOpen,
    resetAll,
  } = usePublicPayment();

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-white text-[#1e1e1e]">

      <FloatingOrnaments variant="overlay" />

      <div className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <PublicPaymentFormSection
          divisions={divisions}
          members={filteredMembers}
          selectedDivisionId={selectedDivisionId}
          selectedMemberId={selectedMemberId}
          selectedMonths={selectedMonths}
          selectedFineMonths={selectedFineMonths}
          paidOrPendingMonths={paidOrPendingMonths}
          availableFineMonths={availableFineMonths}
          totalAmount={totalAmount}
          proofPreviewUrl={proofPreviewUrl}
          formError={formError}
          isSuccess={isSuccess}
          monthNames={monthNames}
          onDivisionChange={handleDivisionChange}
          onMemberChange={handleMemberChange}
          onToggleMonth={toggleMonth}
          onToggleFineMonth={toggleFineMonth}
          onFileChange={handleFileChange}
          onSubmit={handlePreSubmit}
          onReset={resetAll}
        />
      </div>

      <PublicPaymentConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        totalAmount={totalAmount}
        monthsCount={selectedMonths.length}
        fineCount={selectedFineMonths.length}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

