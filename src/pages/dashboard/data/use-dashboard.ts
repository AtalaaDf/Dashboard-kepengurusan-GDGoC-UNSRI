import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/data/auth/auth-context';
import { formatCurrency } from '@/lib/formatters';
import { supabase } from '@/lib/supabase';
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

  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const raw = localStorage.getItem('gdgoc_members_data');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [divisions, setDivisions] = useState<Division[]>(() => {
    try {
      const raw = localStorage.getItem('gdgoc_divisions_data');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [events, setEvents] = useState<OrganizationEvent[]>(() => {
    try {
      const raw = localStorage.getItem('gdgoc_events_data');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [submissions, setSubmissions] = useState<KasSubmission[]>(() => {
    try {
      const raw = localStorage.getItem('gdgoc_kas_submissions');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [expenses, setExpenses] = useState<KasExpense[]>(() => {
    try {
      const raw = localStorage.getItem('gdgoc_kas_expenses');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [batchInfo, setBatchInfo] = useState<{ name: string; year: number }>({
    name: 'Batch 2026',
    year: 2026,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const { data: memData } = await supabase.from('members').select('*');
        if (memData) setMembers(memData as Member[]);

        const { data: divData } = await supabase.from('divisions').select('*');
        if (divData) setDivisions(divData as Division[]);

        const { data: evtData } = await supabase.from('events').select('*');
        if (evtData) setEvents(evtData as OrganizationEvent[]);

        const { data: subData } = await supabase.from('kas_submissions').select('*');
        if (subData) setSubmissions(subData as KasSubmission[]);

        const { data: expData } = await supabase.from('kas_expenses').select('*');
        if (expData) setExpenses(expData as KasExpense[]);

        const { data: bData } = await supabase.from('batches').select('*').eq('is_active', true).maybeSingle();
        if (bData) {
          setBatchInfo({ name: bData.name, year: bData.year });
        }
      } catch {
        // fallback
      }
    }
    loadData();
  }, []);

  const metrics: DashboardMetrics = useMemo(() => {
    // 1. Data Member
    const activeMembersCount = members.filter((m) => m.status === 'active').length;

    // 2. Data Event Terlaksana (absensi final)
    const completedEventsCount = events.filter((e) => e.attendance_finalized).length;

    // 3. Saldo Kas (pemasukan approved dikurangi pengeluaran)
    const totalApproved = submissions
      .filter((s) => s.status === 'approved')
      .reduce((sum, s) => sum + s.total_amount, 0);
    const pendingCashCount = submissions.filter((s) => s.status === 'pending').length;

    const manualIncome = expenses
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses
      .filter((e) => e.type !== 'income')
      .reduce((sum, e) => sum + e.amount, 0);

    const balance = totalApproved + manualIncome - totalExpense;

    return {
      cashBalance: formatCurrency(balance),
      activeMembersCount,
      completedEventsCount,
      divisionsCount: divisions.length,
      pendingCashCount,
      totalMembersCount: members.length,
      batchName: batchInfo.name,
      batchYear: batchInfo.year,
    };
  }, [members, events, submissions, expenses, divisions, batchInfo]);

  return {
    metrics,
    canReviewCash,
    role,
  };
}

