import { useState, useEffect, useMemo } from 'react';
import type { KasSubmission, KasSubmissionItem, KasExpense, Member, Division } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/data/auth/auth-context';

const INITIAL_SUBMISSIONS: KasSubmission[] = [
  {
    id: 'sub-1',
    member_id: 'mem-1',
    status: 'pending',
    proof_path: '/logoGDG.png',
    total_amount: 30000,
    submitted_at: '2026-11-02T10:15:00Z',
    reviewed_at: null,
    reviewed_by_role: null,
  },
  {
    id: 'sub-2',
    member_id: 'mem-3',
    status: 'pending',
    proof_path: '/logoGDG.png',
    total_amount: 20000,
    submitted_at: '2026-11-03T14:30:00Z',
    reviewed_at: null,
    reviewed_by_role: null,
  },
  {
    id: 'sub-3',
    member_id: 'mem-2',
    status: 'approved',
    proof_path: '/logoGDG.png',
    total_amount: 80000,
    submitted_at: '2026-10-28T09:00:00Z',
    reviewed_at: '2026-10-28T16:00:00Z',
    reviewed_by_role: 'executive',
  },
];

const INITIAL_SUBMISSION_ITEMS: KasSubmissionItem[] = [
  { id: 'item-1', submission_id: 'sub-1', member_id: 'mem-1', kind: 'dues', month: 9, amount: 10000, is_active: true },
  { id: 'item-2', submission_id: 'sub-1', member_id: 'mem-1', kind: 'dues', month: 10, amount: 10000, is_active: true },
  { id: 'item-3', submission_id: 'sub-1', member_id: 'mem-1', kind: 'dues', month: 11, amount: 10000, is_active: true },

  { id: 'item-4', submission_id: 'sub-2', member_id: 'mem-3', kind: 'dues', month: 10, amount: 10000, is_active: true },
  { id: 'item-5', submission_id: 'sub-2', member_id: 'mem-3', kind: 'dues', month: 11, amount: 10000, is_active: true },

  { id: 'item-6', submission_id: 'sub-3', member_id: 'mem-2', kind: 'dues', month: 1, amount: 10000, is_active: true },
  { id: 'item-7', submission_id: 'sub-3', member_id: 'mem-2', kind: 'dues', month: 2, amount: 10000, is_active: true },
  { id: 'item-8', submission_id: 'sub-3', member_id: 'mem-2', kind: 'dues', month: 3, amount: 10000, is_active: true },
  { id: 'item-9', submission_id: 'sub-3', member_id: 'mem-2', kind: 'dues', month: 4, amount: 10000, is_active: true },
  { id: 'item-10', submission_id: 'sub-3', member_id: 'mem-2', kind: 'dues', month: 5, amount: 10000, is_active: true },
  { id: 'item-11', submission_id: 'sub-3', member_id: 'mem-2', kind: 'dues', month: 6, amount: 10000, is_active: true },
  { id: 'item-12', submission_id: 'sub-3', member_id: 'mem-2', kind: 'dues', month: 7, amount: 10000, is_active: true },
  { id: 'item-13', submission_id: 'sub-3', member_id: 'mem-2', kind: 'dues', month: 8, amount: 10000, is_active: true },
];

const INITIAL_EXPENSES: KasExpense[] = [
  {
    id: 'exp-1',
    expense_date: '2026-10-15',
    description: 'Pembelian konsumsi workshop Git & GitHub',
    amount: 150000,
    recorded_by_role: 'executive',
    created_at: '2026-10-15T12:00:00Z',
  },
];

const STORAGE_KEY_SUBMISSIONS = 'gdgoc_kas_submissions';
const STORAGE_KEY_ITEMS = 'gdgoc_kas_items';
const STORAGE_KEY_EXPENSES = 'gdgoc_kas_expenses';

export function useCash() {
  const { role } = useAuth();
  const canReview = role === 'superadmin' || role === 'executive';

  const [submissions, setSubmissions] = useState<KasSubmission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [submissionItems, setSubmissionItems] = useState<KasSubmissionItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSION_ITEMS;
  });

  const [expenses, setExpenses] = useState<KasExpense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(submissionItems));
  }, [submissionItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  // Coba sinkronisasi dari Supabase jika ada koneksi
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: subData } = await supabase.from('kas_submissions').select('*');
        if (subData && subData.length > 0) setSubmissions(subData as KasSubmission[]);

        const { data: itemData } = await supabase.from('kas_submission_items').select('*');
        if (itemData && itemData.length > 0) setSubmissionItems(itemData as KasSubmissionItem[]);

        const { data: expData } = await supabase.from('kas_expenses').select('*');
        if (expData && expData.length > 0) setExpenses(expData as KasExpense[]);
      } catch {
        // Fallback local
      }
    }
    loadFromSupabase();
  }, []);

  // Ambil member & division dari localStorage
  const members: Member[] = useMemo(() => {
    const raw = localStorage.getItem('gdgoc_members_data');
    return raw ? JSON.parse(raw) : [];
  }, []);

  const divisions: Division[] = useMemo(() => {
    const raw = localStorage.getItem('gdgoc_divisions_data');
    return raw ? JSON.parse(raw) : [];
  }, []);

  // Hitung Saldo Kas secara langsung dari data dasar
  const totalApprovedIncome = useMemo(() => {
    return submissions
      .filter((s) => s.status === 'approved')
      .reduce((sum, s) => sum + s.total_amount, 0);
  }, [submissions]);

  const totalExpensesAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const currentBalance = useMemo(() => {
    return totalApprovedIncome - totalExpensesAmount;
  }, [totalApprovedIncome, totalExpensesAmount]);

  // Antrean kiriman pending
  const pendingSubmissions = useMemo(() => {
    return submissions.filter((s) => s.status === 'pending');
  }, [submissions]);

  // Terima Pembayaran Kas (Approve)
  const approveSubmission = async (submissionId: string): Promise<boolean> => {
    if (!canReview) {
      setErrorMessage('Hanya Superadmin dan Treasurer yang dapat menerima pembayaran kas.');
      return false;
    }

    const reviewedAt = new Date().toISOString();

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'approved',
              reviewed_at: reviewedAt,
              reviewed_by_role: role || 'executive',
            }
          : s
      )
    );

    try {
      await supabase
        .from('kas_submissions')
        .update({
          status: 'approved',
          reviewed_at: reviewedAt,
          reviewed_by_role: role || 'executive',
        })
        .eq('id', submissionId);
    } catch {
      // Offline fallback
    }

    setErrorMessage(null);
    return true;
  };

  // Tolak Pembayaran Kas (Decline)
  const declineSubmission = async (submissionId: string): Promise<boolean> => {
    if (!canReview) {
      setErrorMessage('Hanya Superadmin dan Treasurer yang dapat menolak pembayaran kas.');
      return false;
    }

    const reviewedAt = new Date().toISOString();

    // Ubah status submission menjadi declined
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'declined',
              reviewed_at: reviewedAt,
              reviewed_by_role: role || 'executive',
            }
          : s
      )
    );

    // Bebaskan item bulan agar tidak aktif lagi (sehingga member bisa bayar ulang bulan itu)
    setSubmissionItems((prev) =>
      prev.map((item) =>
        item.submission_id === submissionId ? { ...item, is_active: false } : item
      )
    );

    try {
      await supabase
        .from('kas_submissions')
        .update({
          status: 'declined',
          reviewed_at: reviewedAt,
          reviewed_by_role: role || 'executive',
        })
        .eq('id', submissionId);

      await supabase
        .from('kas_submission_items')
        .update({ is_active: false })
        .eq('submission_id', submissionId);
    } catch {
      // Offline fallback
    }

    setErrorMessage(null);
    return true;
  };

  // Tambah Pengeluaran Kas
  const addExpense = async (date: string, description: string, amount: number): Promise<boolean> => {
    if (!canReview) {
      setErrorMessage('Hanya Superadmin dan Treasurer yang dapat mencatat pengeluaran.');
      return false;
    }

    const newExpense: KasExpense = {
      id: `exp-${Date.now()}`,
      expense_date: date,
      description: description.trim(),
      amount,
      recorded_by_role: role || 'executive',
      created_at: new Date().toISOString(),
    };

    setExpenses((prev) => [newExpense, ...prev]);

    try {
      await supabase.from('kas_expenses').insert([newExpense]);
    } catch {
      // Offline fallback
    }

    setErrorMessage(null);
    return true;
  };

  const getMemberById = (memberId: string): Member | undefined => {
    return members.find((m) => m.id === memberId);
  };

  const getDivisionByMemberId = (memberId: string): Division | undefined => {
    const mem = getMemberById(memberId);
    if (!mem) return undefined;
    return divisions.find((d) => d.id === mem.division_id);
  };

  const getItemsBySubmissionId = (subId: string): KasSubmissionItem[] => {
    return submissionItems.filter((i) => i.submission_id === subId);
  };

  return {
    submissions,
    submissionItems,
    expenses,
    pendingSubmissions,
    currentBalance,
    totalApprovedIncome,
    totalExpensesAmount,
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
  };
}

