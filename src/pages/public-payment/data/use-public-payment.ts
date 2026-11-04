import { useState, useMemo, useEffect } from 'react';
import type { Division, Member, KasSubmission, KasSubmissionItem } from '@/types';
import { supabase } from '@/lib/supabase';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November'
];

const MONTHLY_FEE = 10000;
const MONTHLY_FINE = 3000;

export function usePublicPayment() {
  const [divisions, setDivisions] = useState<Division[]>(() => {
    const raw = localStorage.getItem('gdgoc_divisions_data');
    return raw ? JSON.parse(raw) : [];
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const raw = localStorage.getItem('gdgoc_members_data');
    return raw ? JSON.parse(raw) : [];
  });

  const [allItems, setAllItems] = useState<KasSubmissionItem[]>(() => {
    const raw = localStorage.getItem('gdgoc_kas_items');
    return raw ? JSON.parse(raw) : [];
  });

  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedFineMonths, setSelectedFineMonths] = useState<number[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofBase64, setProofBase64] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil data divisi dan member aktif langsung dari Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data: divData } = await supabase.from('divisions').select('*');
        if (divData) setDivisions(divData as Division[]);

        const { data: memData } = await supabase.from('members').select('*').eq('status', 'active');
        if (memData) setMembers(memData as Member[]);

        const { data: itemData } = await supabase.from('kas_submission_items').select('*').eq('is_active', true);
        if (itemData) setAllItems(itemData as KasSubmissionItem[]);
      } catch {
        // Fallback local
      }
    }
    loadData();
  }, []);

  // Filter member aktif berdasarkan divisi terpilih
  const filteredMembers = useMemo(() => {
    if (!selectedDivisionId) return [];
    return members.filter(
      (m) => m.division_id === selectedDivisionId && m.status === 'active'
    );
  }, [members, selectedDivisionId]);

  // Ambil data item kas yang sudah dibayar atau pending untuk member terpilih
  const activeItemsForMember: KasSubmissionItem[] = useMemo(() => {
    if (!selectedMemberId) return [];
    return allItems.filter((i) => i.member_id === selectedMemberId && i.is_active);
  }, [selectedMemberId, allItems]);

  // Bulan yang sudah dibayar atau pending (harus disable)
  const paidOrPendingMonths = useMemo(() => {
    return activeItemsForMember
      .filter((i) => i.kind === 'dues')
      .map((i) => i.month);
  }, [activeItemsForMember]);

  // Seluruh bulan yang dapat dipilih untuk denda keterlambatan (Januari s.d. November)
  const availableFineMonths = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter(
      (m) => !activeItemsForMember.some((i) => i.kind === 'fine' && i.month === m)
    );
  }, [activeItemsForMember]);

  // Hitung total nominal otomatis (tidak bisa diedit oleh user)
  const totalAmount = useMemo(() => {
    const duesTotal = selectedMonths.length * MONTHLY_FEE;
    const fineTotal = selectedFineMonths.length * MONTHLY_FINE;
    return duesTotal + fineTotal;
  }, [selectedMonths, selectedFineMonths]);

  const handleDivisionChange = (divId: string) => {
    setSelectedDivisionId(divId);
    setSelectedMemberId('');
    setSelectedMonths([]);
    setSelectedFineMonths([]);
    setFormError(null);
  };

  const handleMemberChange = (mId: string) => {
    setSelectedMemberId(mId);
    setSelectedMonths([]);
    setSelectedFineMonths([]);
    setFormError(null);
  };

  const toggleMonth = (month: number) => {
    if (paidOrPendingMonths.includes(month)) return;
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
    setFormError(null);
  };

  const toggleFineMonth = (month: number) => {
    setSelectedFineMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
    setFormError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('File bukti harus berupa format gambar (JPEG, PNG, atau WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError('Ukuran file bukti maksimal 2 MB.');
      return;
    }

    setProofFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProofBase64(dataUrl);
      setProofPreviewUrl(dataUrl);
    };
    reader.onerror = () => {
      setFormError('Gagal membaca berkas gambar. Silakan coba kembali.');
    };
    reader.readAsDataURL(file);
    setFormError(null);
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedDivisionId) {
      setFormError('Silakan pilih divisi terlebih dahulu.');
      return;
    }

    if (!selectedMemberId) {
      setFormError('Silakan pilih nama member terlebih dahulu.');
      return;
    }

    if (selectedMonths.length === 0 && selectedFineMonths.length === 0) {
      setFormError('Pilih minimal satu bulan iuran atau denda yang akan dibayar.');
      return;
    }

    if (!proofFile && !proofPreviewUrl && !proofBase64) {
      setFormError('Silakan unggah bukti transfer pembayaran.');
      return;
    }

    // Tampilkan dialog konfirmasi: "Data yang diberikan sudah benar?"
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    const submissionPayload = {
      member_id: selectedMemberId,
      status: 'pending' as const,
      proof_path: proofBase64 || proofPreviewUrl || '/logoGDG.png',
      total_amount: totalAmount,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by_role: null,
    };

    let insertedSubmissionId = `sub-${Date.now()}`;

    try {
      const { data: subData, error: subError } = await supabase
        .from('kas_submissions')
        .insert([submissionPayload])
        .select()
        .single();

      if (!subError && subData) {
        insertedSubmissionId = subData.id;
      }
    } catch {
      // offline fallback
    }

    const newSubmission: KasSubmission = {
      id: insertedSubmissionId,
      ...submissionPayload,
    };

    const newItemsPayload = [
      ...selectedMonths.map((m) => ({
        submission_id: insertedSubmissionId,
        member_id: selectedMemberId,
        kind: 'dues' as const,
        month: m,
        amount: MONTHLY_FEE,
        is_active: true,
      })),
      ...selectedFineMonths.map((m) => ({
        submission_id: insertedSubmissionId,
        member_id: selectedMemberId,
        kind: 'fine' as const,
        month: m,
        amount: MONTHLY_FINE,
        is_active: true,
      })),
    ];

    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('kas_submission_items')
        .insert(newItemsPayload)
        .select();

      if (!itemsError && itemsData) {
        setAllItems((prev) => [...(itemsData as KasSubmissionItem[]), ...prev]);
      }
    } catch {
      // offline fallback
    }

    const fallbackItems: KasSubmissionItem[] = newItemsPayload.map((item, index) => ({
      id: `item-${insertedSubmissionId}-${index}`,
      ...item,
    }));

    setAllItems((prev) => [...fallbackItems, ...prev]);

    try {
      const rawSubs = localStorage.getItem('gdgoc_kas_submissions');
      const existingSubs: KasSubmission[] = rawSubs ? JSON.parse(rawSubs) : [];
      localStorage.setItem(
        'gdgoc_kas_submissions',
        JSON.stringify([newSubmission, ...existingSubs])
      );

      const rawItems = localStorage.getItem('gdgoc_kas_items');
      const existingItems: KasSubmissionItem[] = rawItems ? JSON.parse(rawItems) : [];
      localStorage.setItem(
        'gdgoc_kas_items',
        JSON.stringify([...fallbackItems, ...existingItems])
      );
    } catch {
      // ignore
    }

    setIsSubmitting(false);
    setIsConfirmOpen(false);
    setIsSuccess(true);
  };

  const resetAll = () => {
    setSelectedDivisionId('');
    setSelectedMemberId('');
    setSelectedMonths([]);
    setSelectedFineMonths([]);
    setProofFile(null);
    setProofPreviewUrl(null);
    setProofBase64(null);
    setIsSuccess(false);
    setFormError(null);
  };

  return {
    divisions,
    filteredMembers,
    selectedDivisionId,
    selectedMemberId,
    selectedMonths,
    selectedFineMonths,
    paidOrPendingMonths,
    availableFineMonths,
    totalAmount,
    proofFile,
    proofPreviewUrl,
    isConfirmOpen,
    isSuccess,
    formError,
    isSubmitting,
    monthNames: MONTH_NAMES,
    handleDivisionChange,
    handleMemberChange,
    toggleMonth,
    toggleFineMonth,
    handleFileChange,
    handlePreSubmit,
    handleConfirmSubmit,
    setIsConfirmOpen,
    resetAll,
  };
}

