import { useState, useEffect, useMemo } from 'react';
import type { Division, Member } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/data/auth/auth-context';

const INITIAL_DIVISIONS: Division[] = [
  { id: 'div-1', name: 'Frontend Development', type: 'technical' },
  { id: 'div-2', name: 'Backend Development', type: 'technical' },
  { id: 'div-3', name: 'UI/UX Design', type: 'non_technical' },
  { id: 'div-4', name: 'Public Relations', type: 'non_technical' },
];

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    batch_id: 'batch-2026',
    division_id: 'div-1',
    full_name: 'Ahmad Fauzan',
    status: 'active',
  },
  {
    id: 'mem-2',
    batch_id: 'batch-2026',
    division_id: 'div-1',
    full_name: 'Siti Rahmawati',
    status: 'active',
  },
  {
    id: 'mem-3',
    batch_id: 'batch-2026',
    division_id: 'div-2',
    full_name: 'Budi Santoso',
    status: 'active',
  },
  {
    id: 'mem-4',
    batch_id: 'batch-2026',
    division_id: 'div-3',
    full_name: 'Nabila Putri',
    status: 'active',
  },
  {
    id: 'mem-5',
    batch_id: 'batch-2026',
    division_id: 'div-4',
    full_name: 'Dimas Anggara',
    status: 'inactive',
  },
];

const STORAGE_KEY_MEMBERS = 'gdgoc_members_data';
const STORAGE_KEY_DIVISIONS = 'gdgoc_divisions_data';

export function useMembers() {
  const { role } = useAuth();
  const [divisions, setDivisions] = useState<Division[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DIVISIONS);
    return saved ? JSON.parse(saved) : INITIAL_DIVISIONS;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DIVISIONS, JSON.stringify(divisions));
  }, [divisions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  }, [members]);

  // Coba ambil dari Supabase jika terhubung
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: divData } = await supabase.from('divisions').select('*');
        if (divData && divData.length > 0) {
          setDivisions(divData as Division[]);
        }

        const { data: memData } = await supabase.from('members').select('*');
        if (memData && memData.length > 0) {
          setMembers(memData as Member[]);
        }
      } catch {
        // Fallback memakai local state
      }
    }
    loadFromSupabase();
  }, []);

  const isSuperadmin = role === 'superadmin';

  // Tambah Divisi
  const addDivision = async (name: string, type: 'technical' | 'non_technical'): Promise<boolean> => {
    if (!isSuperadmin) {
      setErrorMessage('Hanya Superadmin yang dapat membuat divisi.');
      return false;
    }

    const trimmed = name.trim();
    if (divisions.some((d) => d.name.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMessage('Nama divisi sudah terdaftar.');
      return false;
    }

    const newDivision: Division = {
      id: `div-${Date.now()}`,
      name: trimmed,
      type,
    };

    try {
      await supabase.from('divisions').insert([newDivision]);
    } catch {
      // Offline fallback
    }

    setDivisions((prev) => [...prev, newDivision]);
    setErrorMessage(null);
    return true;
  };

  // Hapus Divisi (hanya jika tidak ada member di divisi itu)
  const deleteDivision = async (divisionId: string): Promise<boolean> => {
    if (!isSuperadmin) {
      setErrorMessage('Hanya Superadmin yang dapat menghapus divisi.');
      return false;
    }

    const hasMembers = members.some((m) => m.division_id === divisionId);
    if (hasMembers) {
      setErrorMessage('Divisi yang masih memiliki member tidak dapat dihapus.');
      return false;
    }

    try {
      await supabase.from('divisions').delete().eq('id', divisionId);
    } catch {
      // Offline fallback
    }

    setDivisions((prev) => prev.filter((d) => d.id !== divisionId));
    setErrorMessage(null);
    return true;
  };

  // Tambah Member
  const addMember = async (fullName: string, divisionId: string): Promise<boolean> => {
    if (!isSuperadmin) {
      setErrorMessage('Hanya Superadmin yang dapat menambahkan member.');
      return false;
    }

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      batch_id: 'batch-2026',
      division_id: divisionId,
      full_name: fullName.trim(),
      status: 'active',
    };

    try {
      await supabase.from('members').insert([newMember]);
    } catch {
      // Offline fallback
    }

    setMembers((prev) => [newMember, ...prev]);
    setErrorMessage(null);
    return true;
  };

  // Toggle status aktif/nonaktif (mengeluarkan member = menonaktifkan)
  const toggleMemberStatus = async (memberId: string): Promise<boolean> => {
    if (!isSuperadmin) {
      setErrorMessage('Hanya Superadmin yang dapat mengubah status member.');
      return false;
    }

    const target = members.find((m) => m.id === memberId);
    if (!target) return false;

    const updatedStatus = target.status === 'active' ? 'inactive' : 'active';

    try {
      await supabase
        .from('members')
        .update({ status: updatedStatus })
        .eq('id', memberId);
    } catch {
      // Offline fallback
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, status: updatedStatus } : m))
    );
    setErrorMessage(null);
    return true;
  };

  // Filter dan Pencarian
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchQuery = member.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const matchDivision =
        selectedDivisionFilter === 'all' ||
        member.division_id === selectedDivisionFilter;
      const matchStatus =
        selectedStatusFilter === 'all' ||
        member.status === selectedStatusFilter;

      return matchQuery && matchDivision && matchStatus;
    });
  }, [members, searchQuery, selectedDivisionFilter, selectedStatusFilter]);

  const getDivisionById = (divisionId: string): Division | undefined => {
    return divisions.find((d) => d.id === divisionId);
  };

  return {
    divisions,
    members: filteredMembers,
    totalMembersCount: members.length,
    activeMembersCount: members.filter((m) => m.status === 'active').length,
    searchQuery,
    setSearchQuery,
    selectedDivisionFilter,
    setSelectedDivisionFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    errorMessage,
    setErrorMessage,
    isSuperadmin,
    addDivision,
    deleteDivision,
    addMember,
    toggleMemberStatus,
    getDivisionById,
  };
}

