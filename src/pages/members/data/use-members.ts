import { useState, useEffect, useMemo } from 'react';
import type { Division, Member } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/data/auth/auth-context';

const STORAGE_KEY_MEMBERS = 'gdgoc_members_data';
const STORAGE_KEY_DIVISIONS = 'gdgoc_divisions_data';

export function useMembers() {
  const { role } = useAuth();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: divData, error: divErr } = await supabase.from('divisions').select('*');
        if (!divErr && divData) {
          setDivisions(divData as Division[]);
          localStorage.setItem(STORAGE_KEY_DIVISIONS, JSON.stringify(divData));
        }

        const { data: memData, error: memErr } = await supabase.from('members').select('*');
        if (!memErr && memData) {
          setMembers(memData as Member[]);
          localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(memData));
        }
      } catch {
        const savedDivs = localStorage.getItem(STORAGE_KEY_DIVISIONS);
        if (savedDivs) setDivisions(JSON.parse(savedDivs));
        const savedMems = localStorage.getItem(STORAGE_KEY_MEMBERS);
        if (savedMems) setMembers(JSON.parse(savedMems));
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

    const divisionPayload = {
      name: trimmed,
      type,
    };

    try {
      const { data, error } = await supabase.from('divisions').insert([divisionPayload]).select().single();
      if (!error && data) {
        setDivisions((prev) => [...prev, data as Division]);
        setErrorMessage(null);
        return true;
      }
    } catch {
      // Fallback
    }

    const newDivision: Division = {
      id: `div-${Date.now()}`,
      name: trimmed,
      type,
    };

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

    // Cari batch aktif jika ada
    let activeBatchId = 'b0000000-0000-0000-0000-000000002026';
    try {
      const { data: batchData } = await supabase.from('batches').select('id').eq('is_active', true).maybeSingle();
      if (batchData?.id) {
        activeBatchId = batchData.id;
      }
    } catch {
      // abaikan
    }

    const memberPayload = {
      batch_id: activeBatchId,
      division_id: divisionId,
      full_name: fullName.trim(),
      status: 'active' as const,
    };

    try {
      const { data, error } = await supabase.from('members').insert([memberPayload]).select().single();
      if (!error && data) {
        setMembers((prev) => [data as Member, ...prev]);
        setErrorMessage(null);
        return true;
      }
    } catch {
      // Offline fallback
    }

    const newMember: Member = {
      id: `mem-${Date.now()}`,
      ...memberPayload,
    };

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

  // Hapus Member
  const deleteMember = async (memberId: string): Promise<boolean> => {
    if (!isSuperadmin) {
      setErrorMessage('Hanya Superadmin yang dapat menghapus member.');
      return false;
    }

    try {
      await supabase.from('members').delete().eq('id', memberId);
    } catch {
      // Offline fallback
    }

    setMembers((prev) => prev.filter((m) => m.id !== memberId));

    // Bersihkan data relasi terkait di localStorage
    try {
      const rawAtt = localStorage.getItem('gdgoc_attendances_data');
      if (rawAtt) {
        const atts = JSON.parse(rawAtt);
        localStorage.setItem(
          'gdgoc_attendances_data',
          JSON.stringify(atts.filter((a: { member_id: string }) => a.member_id !== memberId))
        );
      }

      const rawComps = localStorage.getItem('gdgoc_competitions_data');
      if (rawComps) {
        const comps = JSON.parse(rawComps);
        localStorage.setItem(
          'gdgoc_competitions_data',
          JSON.stringify(comps.filter((c: { member_id: string }) => c.member_id !== memberId))
        );
      }

      const rawPuns = localStorage.getItem('gdgoc_punishments_data');
      if (rawPuns) {
        const puns = JSON.parse(rawPuns);
        localStorage.setItem(
          'gdgoc_punishments_data',
          JSON.stringify(puns.filter((p: { member_id: string }) => p.member_id !== memberId))
        );
      }

      const rawSubs = localStorage.getItem('gdgoc_kas_submissions');
      if (rawSubs) {
        const subs = JSON.parse(rawSubs);
        localStorage.setItem(
          'gdgoc_kas_submissions',
          JSON.stringify(subs.filter((s: { member_id: string }) => s.member_id !== memberId))
        );
      }

      const rawItems = localStorage.getItem('gdgoc_kas_items');
      if (rawItems) {
        const items = JSON.parse(rawItems);
        localStorage.setItem(
          'gdgoc_kas_items',
          JSON.stringify(items.filter((i: { member_id: string }) => i.member_id !== memberId))
        );
      }
    } catch {
      // abaikan error storage
    }

    setErrorMessage(null);
    return true;
  };

  // Filter, Pencarian, dan Sortir Otomatis
  const filteredMembers = useMemo(() => {
    const list = members.filter((member) => {
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

    const divMap = new Map<string, Division>(divisions.map((d) => [d.id, d]));

    return list.sort((a, b) => {
      const divA = divMap.get(a.division_id);
      const divB = divMap.get(b.division_id);

      // 1. Kategori Divisi: non_technical (0) duluan, lalu technical (1), tanpa divisi (2)
      const catOrder = (d?: Division) => {
        if (!d) return 2;
        return d.type === 'non_technical' ? 0 : 1;
      };

      const catA = catOrder(divA);
      const catB = catOrder(divB);

      if (catA !== catB) {
        return catA - catB;
      }

      // 2. Nama Divisi secara alfabetis (A-Z)
      const divNameA = divA?.name || '';
      const divNameB = divB?.name || '';
      const divComp = divNameA.localeCompare(divNameB, 'id');
      if (divComp !== 0) {
        return divComp;
      }

      // 3. Nama Member secara alfabetis (A-Z)
      return a.full_name.localeCompare(b.full_name, 'id');
    });
  }, [members, divisions, searchQuery, selectedDivisionFilter, selectedStatusFilter]);

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
    deleteMember,
    getDivisionById,
  };
}

