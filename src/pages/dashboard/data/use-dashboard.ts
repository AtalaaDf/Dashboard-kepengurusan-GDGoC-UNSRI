import { useMemo } from 'react';
import { useAuth } from '@/data/auth/auth-context';
import { formatCurrency } from '@/lib/formatters';
import type { Member, Division, OrganizationEvent, KasSubmission, KasExpense } from '@/types';

export interface DashboardMetrics {
  cashBalance: string;
  activeMembersCount: number;
  completedEventsCount: number;
  divisionsCount: number;
  pendingCashCount: number;
  totalMembersCount: number;
  batchName: string;
  batchYear: number;
}

export function useDashboard() {
  const { role } = useAuth();
  const canReviewCash = role === 'superadmin' || role === 'executive';

  const metrics: DashboardMetrics = useMemo(() => {
    // 1. Data Member
    const rawMembers = localStorage.getItem('gdgoc_members_data');
    const members: Member[] = rawMembers ? JSON.parse(rawMembers) : [];
    const activeMembersCount = members.filter((m) => m.status === 'active').length;

    // 2. Data Divisi
    const rawDivisions = localStorage.getItem('gdgoc_divisions_data');
    const divisions: Division[] = rawDivisions ? JSON.parse(rawDivisions) : [];

    // 3. Data Event Terlaksana (absensi final & status active)
    const rawEvents = localStorage.getItem('gdgoc_events_data');
    const events: OrganizationEvent[] = rawEvents ? JSON.parse(rawEvents) : [];
    const completedEventsCount = events.filter(
      (e) => e.attendance_finalized && e.status === 'active'
    ).length;

    // 4. Saldo Kas (pemasukan approved dikurangi pengeluaran)
    const rawSubs = localStorage.getItem('gdgoc_kas_submissions');
    const submissions: KasSubmission[] = rawSubs ? JSON.parse(rawSubs) : [];
    const totalApproved = submissions
      .filter((s) => s.status === 'approved')
      .reduce((sum, s) => sum + s.total_amount, 0);
    const pendingCashCount = submissions.filter((s) => s.status === 'pending').length;

    const rawExpenses = localStorage.getItem('gdgoc_kas_expenses');
    const expenses: KasExpense[] = rawExpenses ? JSON.parse(rawExpenses) : [];
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    const balance = totalApproved - totalExpense;

    return {
      cashBalance: formatCurrency(balance),
      activeMembersCount,
      completedEventsCount,
      divisionsCount: divisions.length,
      pendingCashCount,
      totalMembersCount: members.length,
      batchName: 'Batch 2026',
      batchYear: 2026,
    };
  }, []);

  return {
    metrics,
    canReviewCash,
    role,
  };
}

