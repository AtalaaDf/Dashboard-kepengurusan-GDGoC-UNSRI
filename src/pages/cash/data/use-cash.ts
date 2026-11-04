import { useState, useEffect, useMemo } from 'react';
import type { KasSubmission, KasSubmissionItem, KasExpense, KasRecordType, Member, Division } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/data/auth/auth-context';

const STORAGE_KEY_SUBMISSIONS = 'gdgoc_kas_submissions';
const STORAGE_KEY_ITEMS = 'gdgoc_kas_items';
const STORAGE_KEY_EXPENSES = 'gdgoc_kas_expenses';

export function useCash() {
  const { role } = useAuth();
  const canReview = role === 'superadmin' || role === 'executive';

  const [submissions, setSubmissions] = useState<KasSubmission[]>([]);
  const [submissionItems, setSubmissionItems] = useState<KasSubmissionItem[]>([]);
  const [expenses, setExpenses] = useState<KasExpense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);

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
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: subData, error: subErr } = await supabase.from('kas_submissions').select('*');
        if (!subErr && subData) {
          setSubmissions(subData as KasSubmission[]);
          localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(subData));
        }

        const { data: itemData, error: itemErr } = await supabase.from('kas_submission_items').select('*');
        if (!itemErr && itemData) {
          setSubmissionItems(itemData as KasSubmissionItem[]);
          localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(itemData));
        }

        const { data: expData, error: expErr } = await supabase.from('kas_expenses').select('*');
        if (!expErr && expData) {
          setExpenses(expData as KasExpense[]);
          localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expData));
        }

        const { data: memData } = await supabase.from('members').select('*');
        if (memData) setMembers(memData as Member[]);

        const { data: divData } = await supabase.from('divisions').select('*');
        if (divData) setDivisions(divData as Division[]);
      } catch {
        const savedSubs = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
        if (savedSubs) setSubmissions(JSON.parse(savedSubs));
        const savedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
        if (savedItems) setSubmissionItems(JSON.parse(savedItems));
        const savedExps = localStorage.getItem(STORAGE_KEY_EXPENSES);
        if (savedExps) setExpenses(JSON.parse(savedExps));
        const savedMems = localStorage.getItem('gdgoc_members_data');
        if (savedMems) setMembers(JSON.parse(savedMems));
        const savedDivs = localStorage.getItem('gdgoc_divisions_data');
        if (savedDivs) setDivisions(JSON.parse(savedDivs));
      }
    }
    loadFromSupabase();
  }, []);

  // Hitung Saldo Kas secara langsung dari data dasar
  const totalApprovedIncome = useMemo(() => {
    const duesIncome = submissions
      .filter((s) => s.status === 'approved')
      .reduce((sum, s) => sum + s.total_amount, 0);
    const manualIncome = expenses
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    return duesIncome + manualIncome;
  }, [submissions, expenses]);

  const totalExpensesAmount = useMemo(() => {
    return expenses
      .filter((e) => e.type !== 'income')
      .reduce((sum, e) => sum + e.amount, 0);
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

  // Tambah Catatan Kas (Pengeluaran atau Pemasukan Sponsor/Lainnya)
  const addCashRecord = async (
    type: KasRecordType,
    date: string,
    description: string,
    amount: number
  ): Promise<boolean> => {
    if (!canReview) {
      setErrorMessage('Hanya Superadmin dan Treasurer yang dapat mencatat kas.');
      return false;
    }

    const newRecord: KasExpense = {
      id: `${type === 'income' ? 'inc' : 'exp'}-${Date.now()}`,
      expense_date: date,
      description: description.trim(),
      amount,
      type,
      recorded_by_role: role || 'executive',
      created_at: new Date().toISOString(),
    };

    setExpenses((prev) => [newRecord, ...prev]);

    try {
      await supabase.from('kas_expenses').insert([newRecord]);
    } catch {
      // Offline fallback
    }

    setErrorMessage(null);
    return true;
  };

  const addExpense = (date: string, description: string, amount: number) => {
    return addCashRecord('expense', date, description, amount);
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
    addCashRecord,
    addExpense,
    getMemberById,
    getDivisionByMemberId,
    getItemsBySubmissionId,
  };
}

