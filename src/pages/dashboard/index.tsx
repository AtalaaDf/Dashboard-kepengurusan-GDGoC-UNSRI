import React from 'react';
import { useDashboard } from './data/use-dashboard';
import { DashboardHeaderSection } from './sections/DashboardHeaderSection';
import { DashboardBentoSection } from './sections/DashboardBentoSection';
import { ANIMATIONS } from '@/lib/animations';

export const DashboardPage: React.FC = () => {
  const { metrics, canReviewCash } = useDashboard();

  return (
    <div className={`flex flex-col gap-6 ${ANIMATIONS.PAGE_FADE_IN}`}>
      <DashboardHeaderSection
        canReviewCash={canReviewCash}
        pendingCashCount={metrics.pendingCashCount}
        batchName={metrics.batchName}
      />

      <DashboardBentoSection metrics={metrics} />
    </div>
  );
};
