import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { Division, Member, OrganizationEvent, Attendance, CompetitionEntry, Punishment } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/data/auth/auth-context';

export interface MemberEventAttendance {
  eventId: string;
  eventName: string;
  eventDate: string;
  isAttended: boolean;
  isFinalized: boolean;
}

export interface MemberKasMonth {
  month: number;
  monthName: string;
  isPaid: boolean;
  hasFine: boolean;
  isFinePaid: boolean;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November'
];

const INITIAL_COMPETITIONS: CompetitionEntry[] = [
  {
    id: 'comp-1',
    member_id: 'mem-1',
    competition_name: 'Hackathon Nasional Gemastik 2026',
    organizer: 'Puspresnas Kemendikbud',
    created_at: '2026-10-15',
  },
  {
    id: 'comp-2',
    member_id: 'mem-3',
    competition_name: 'Competitive Programming Compfest 18',
    organizer: 'Universitas Indonesia',
    created_at: '2026-10-20',
  },
];

const INITIAL_PUNISHMENTS: Punishment[] = [
  {
    id: 'pun-1',
    member_id: 'mem-5',
    is_completed: false,
    completed_at: null,
  },
];

const STORAGE_KEY_COMPETITIONS = 'gdgoc_competitions_data';
const STORAGE_KEY_PUNISHMENTS = 'gdgoc_punishments_data';

export function useMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const canRecord = role === 'superadmin' || role === 'admin';

  const members: Member[] = useMemo(() => {
    const raw = localStorage.getItem('gdgoc_members_data');
    return raw ? JSON.parse(raw) : [];
  }, []);

  const divisions: Division[] = useMemo(() => {
    const raw = localStorage.getItem('gdgoc_divisions_data');
    return raw ? JSON.parse(raw) : [];
  }, []);

  const events: OrganizationEvent[] = useMemo(() => {
    const raw = localStorage.getItem('gdgoc_events_data');
    return raw ? JSON.parse(raw) : [];
  }, []);

  const attendances: Attendance[] = useMemo(() => {
    const raw = localStorage.getItem('gdgoc_attendances_data');
    return raw ? JSON.parse(raw) : [];
  }, []);

  const [competitions, setCompetitions] = useState<CompetitionEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COMPETITIONS);
    return saved ? JSON.parse(saved) : INITIAL_COMPETITIONS;
  });

  const [punishments, setPunishments] = useState<Punishment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PUNISHMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PUNISHMENTS;
  });

  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPETITIONS, JSON.stringify(competitions));
  }, [competitions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PUNISHMENTS, JSON.stringify(punishments));
  }, [punishments]);

  // Coba ambil dari Supabase jika online
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: compData } = await supabase.from('competition_entries').select('*');
        if (compData && compData.length > 0) {
          setCompetitions(compData as CompetitionEntry[]);
        }

        const { data: punData } = await supabase.from('punishments').select('*');
        if (punData && punData.length > 0) {
          setPunishments(punData as Punishment[]);
        }
      } catch {
        // Fallback local
      }
    }
    loadFromSupabase();
  }, []);

  const currentMember = useMemo(() => {
    return members.find((m) => m.id === id);
  }, [members, id]);

  const currentDivision = useMemo(() => {
    if (!currentMember) return undefined;
    return divisions.find((d) => d.id === currentMember.division_id);
  }, [divisions, currentMember]);

  const isTechnical = currentDivision?.type === 'technical';

  // Daftar absensi event aktif
  const eventsAttendance: MemberEventAttendance[] = useMemo(() => {
    if (!currentMember) return [];

    return events
      .filter((evt) => evt.status === 'active')
      .map((evt) => {
        const isAttended = attendances.some(
          (att) => att.event_id === evt.id && att.member_id === currentMember.id
        );

        return {
          eventId: evt.id,
          eventName: evt.name,
          eventDate: evt.event_date,
          isAttended,
          isFinalized: evt.attendance_finalized,
        };
      });
  }, [events, attendances, currentMember]);

  // Data Kas Januari sampai November
  const kasMonths: MemberKasMonth[] = useMemo(() => {
    return MONTH_NAMES.map((name, idx) => {
      const monthNum = idx + 1;
      const isPaid = monthNum <= 8; // dummy: lunas sampai Agustus
      const hasFine = monthNum === 5;
      const isFinePaid = monthNum === 5;
      return {
        month: monthNum,
        monthName: name,
        isPaid,
        hasFine,
        isFinePaid,
      };
    });
  }, []);

  // Catatan lomba untuk member saat ini
  const memberCompetitions = useMemo(() => {
    if (!currentMember) return [];
    return competitions.filter((c) => c.member_id === currentMember.id);
  }, [competitions, currentMember]);

  // Punishment status member saat ini
  const currentPunishment = useMemo(() => {
    if (!currentMember) return undefined;
    return punishments.find((p) => p.member_id === currentMember.id);
  }, [punishments, currentMember]);

  // Hitung jumlah absen final
  const finalizedEvents = useMemo(() => {
    return eventsAttendance.filter((e) => e.isFinalized);
  }, [eventsAttendance]);

  const absentCount = useMemo(() => {
    return finalizedEvents.filter((e) => !e.isAttended).length;
  }, [finalizedEvents]);

  const attendedCount = useMemo(() => {
    return finalizedEvents.filter((e) => e.isAttended).length;
  }, [finalizedEvents]);

  const maxAbsences = 3;
  const isPunishmentRequired = absentCount > maxAbsences;
  const isPunishmentCompleted = Boolean(currentPunishment?.is_completed);

  // Tambah Lomba
  const addCompetition = async (name: string, organizer: string): Promise<boolean> => {
    if (!canRecord || !currentMember) {
      setActionError('Hanya Superadmin dan Admin yang dapat mencatat lomba.');
      return false;
    }

    const newComp: CompetitionEntry = {
      id: `comp-${Date.now()}`,
      member_id: currentMember.id,
      competition_name: name.trim(),
      organizer: organizer.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('competition_entries').insert([newComp]);
    } catch {
      // Offline fallback
    }

    setCompetitions((prev) => [newComp, ...prev]);
    setActionError(null);
    return true;
  };

  // Hapus Lomba
  const deleteCompetition = async (compId: string): Promise<boolean> => {
    if (!canRecord) {
      setActionError('Hanya Superadmin dan Admin yang dapat menghapus catatan lomba.');
      return false;
    }

    try {
      await supabase.from('competition_entries').delete().eq('id', compId);
    } catch {
      // Offline fallback
    }

    setCompetitions((prev) => prev.filter((c) => c.id !== compId));
    setActionError(null);
    return true;
  };

  // Toggle Punishment (Hanya boleh untuk yang absennya melebihi batas, agent.md 7.5 & 8)
  const togglePunishmentStatus = async (): Promise<boolean> => {
    if (!canRecord || !currentMember) {
      setActionError('Hanya Superadmin dan Admin yang dapat mencatat punishment.');
      return false;
    }

    if (!isPunishmentRequired) {
      setActionError(
        'Punishment hanya berlaku bagi member yang jumlah absennya melebihi batas aman (4 atau lebih).'
      );
      return false;
    }

    const nextCompleted = !isPunishmentCompleted;
    const completedAt = nextCompleted ? new Date().toISOString() : null;

    if (currentPunishment) {
      setPunishments((prev) =>
        prev.map((p) =>
          p.member_id === currentMember.id
            ? { ...p, is_completed: nextCompleted, completed_at: completedAt }
            : p
        )
      );

      try {
        await supabase
          .from('punishments')
          .update({ is_completed: nextCompleted, completed_at: completedAt })
          .eq('member_id', currentMember.id);
      } catch {
        // Offline fallback
      }
    } else {
      const newPun: Punishment = {
        id: `pun-${Date.now()}`,
        member_id: currentMember.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      };

      setPunishments((prev) => [...prev, newPun]);

      try {
        await supabase.from('punishments').insert([newPun]);
      } catch {
        // Offline fallback
      }
    }

    setActionError(null);
    return true;
  };

  // Perhitungan kelulusan sementara (agent.md 7.8)
  const graduationStatus = useMemo(() => {
    const reasons: string[] = [];

    // 1. Kas seluruhnya
    const unpaidMonths = kasMonths.filter((m) => !m.isPaid);
    if (unpaidMonths.length > 0) {
      reasons.push(
        `Iuran kas belum lunas untuk ${unpaidMonths.length} bulan (${unpaidMonths.map((m) => m.monthName).join(', ')})`
      );
    }

    const unpaidFines = kasMonths.filter((m) => m.hasFine && !m.isFinePaid);
    if (unpaidFines.length > 0) {
      reasons.push('Terdapat sisa denda keterlambatan kas yang belum dibayar');
    }

    // 2. Absensi: aman jika absen <= 3 ATAU punishment sudah dijalani
    if (absentCount > maxAbsences) {
      if (!isPunishmentCompleted) {
        reasons.push(
          `Jumlah absen (${absentCount}) melebihi batas toleransi (${maxAbsences}) dan punishment belum diselesaikan`
        );
      }
    }

    // 3. Lomba (khusus technical wajib minimal 1)
    if (isTechnical && memberCompetitions.length === 0) {
      reasons.push('Member technical wajib mengikuti minimal 1 lomba');
    }

    const isGraduated = reasons.length === 0;

    return {
      isGraduated,
      reasons,
      absentCount,
      attendedCount,
    };
  }, [
    kasMonths,
    absentCount,
    attendedCount,
    isTechnical,
    memberCompetitions,
    isPunishmentCompleted,
  ]);

  return {
    member: currentMember,
    division: currentDivision,
    isTechnical,
    canRecord,
    eventsAttendance,
    kasMonths,
    competitions: memberCompetitions,
    punishment: currentPunishment,
    isPunishmentRequired,
    isPunishmentCompleted,
    graduationStatus,
    actionError,
    clearActionError: () => setActionError(null),
    addCompetition,
    deleteCompetition,
    togglePunishmentStatus,
  };
}
