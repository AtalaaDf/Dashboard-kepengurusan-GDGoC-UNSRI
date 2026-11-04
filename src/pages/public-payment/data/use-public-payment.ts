import { useState, useMemo } from 'react';
import type { Division, Member, KasSubmission, KasSubmissionItem } from '@/types';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November'
];

const MONTHLY_FEE = 10000;
const MONTHLY_FINE = 3000;

export function usePublicPayment() {
  const divisions: Division[] = useMemo(() => {
    const raw = localStorage.getItem('gdgoc_divisions_data');
    return raw ? JSON.parse(raw) : [];
  }, []);

  const members: Member[] = useMemo(() => {
    const raw = localStorage.getItem('gdgoc_members_data');
    return raw ? JSON.parse(raw) : [];
  }, []);

  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [selectedFineMonths, setSelectedFineMonths] = useState<number[]>([]);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter member aktif berdasarkan divisi terpilih
  const filteredMembers = useMemo(() => {
    if (!selectedDivisionId) return [];
    return members.filter(
      (m) => m.division_id === selectedDivisionId && m.status === 'active'
    );
  }, [members, selectedDivisionId]);

  // Ambil data item kas yang sudah dibayar atau pending untuk member terpilih
  const activeItemsForMember: KasSubmissionItem[] = useMemo(() => {
    void isSuccess;
    if (!selectedMemberId) return [];
    try {
      const raw = localStorage.getItem('gdgoc_kas_items');
      const items: KasSubmissionItem[] = raw ? JSON.parse(raw) : [];
      return items.filter((i) => i.member_id === selectedMemberId && i.is_active);
    } catch {
      return [];
    }
  }, [selectedMemberId, isSuccess]);

  // Bulan yang sudah dibayar atau pending (harus disable)
  const paidOrPendingMonths = useMemo(() => {
    return activeItemsForMember
      .filter((i) => i.kind === 'dues')
      .map((i) => i.month);
  }, [activeItemsForMember]);

  // Simulasi bulan yang terkena denda (misal: bulan sebelum bulan saat ini yang belum dibayar)
  const availableFineMonths = useMemo(() => {
    // Sebagai contoh realistis: bulan 1 s/d 5 berpotensi kena denda jika belum dibayar
    return [1, 2, 3, 4, 5].filter(
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
    setProofPreviewUrl(URL.createObjectURL(file));
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

    if (!proofFile && !proofPreviewUrl) {
      setFormError('Silakan unggah bukti transfer pembayaran.');
      return;
    }

    // Tampilkan dialog konfirmasi: "Data yang diberikan sudah benar?"
    setIsConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    const submissionId = `sub-${Date.now()}`;
    const newSubmission: KasSubmission = {
      id: submissionId,
      member_id: selectedMemberId,
      status: 'pending',
      proof_path: proofPreviewUrl || '/logoGDG.png',
      total_amount: totalAmount,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by_role: null,
    };

    const newItems: KasSubmissionItem[] = [
      ...selectedMonths.map((m) => ({
        id: `item-${submissionId}-d-${m}`,
        submission_id: submissionId,
        member_id: selectedMemberId,
        kind: 'dues' as const,
        month: m,
        amount: MONTHLY_FEE,
        is_active: true,
      })),
      ...selectedFineMonths.map((m) => ({
        id: `item-${submissionId}-f-${m}`,
        submission_id: submissionId,
        member_id: selectedMemberId,
        kind: 'fine' as const,
        month: m,
        amount: MONTHLY_FINE,
        is_active: true,
      })),
    ];

    // Simpan ke localStorage
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
      JSON.stringify([...newItems, ...existingItems])
    );

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

