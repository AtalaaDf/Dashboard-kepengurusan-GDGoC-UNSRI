import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type {
  Division,
  Member,
  OrganizationEvent,
  Attendance,
  CompetitionEntry,
  Punishment,
  KasSubmission,
  KasSubmissionItem,
} from '@/types';
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

const STORAGE_KEY_COMPETITIONS = 'gdgoc_competitions_data';
const STORAGE_KEY_PUNISHMENTS = 'gdgoc_punishments_data';

export function useMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const canRecord = role === 'superadmin' || role === 'admin';

  const [members, setMembers] = useState<Member[]>(() => {
    const raw = localStorage.getItem('gdgoc_members_data');
    return raw ? JSON.parse(raw) : [];
  });

  const [divisions, setDivisions] = useState<Division[]>(() => {
    const raw = localStorage.getItem('gdgoc_divisions_data');
    return raw ? JSON.parse(raw) : [];
  });

  const [events, setEvents] = useState<OrganizationEvent[]>(() => {
    const raw = localStorage.getItem('gdgoc_events_data');
    return raw ? JSON.parse(raw) : [];
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const raw = localStorage.getItem('gdgoc_attendances_data');
    return raw ? JSON.parse(raw) : [];
  });

  const [competitions, setCompetitions] = useState<CompetitionEntry[]>([]);
  const [punishments, setPunishments] = useState<Punishment[]>([]);

  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMPETITIONS, JSON.stringify(competitions));
  }, [competitions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PUNISHMENTS, JSON.stringify(punishments));
  }, [punishments]);

  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: compData, error: compErr } = await supabase.from('competition_entries').select('*');
        if (!compErr && compData) {
          setCompetitions(compData as CompetitionEntry[]);
          localStorage.setItem(STORAGE_KEY_COMPETITIONS, JSON.stringify(compData));
        }

        const { data: punData, error: punErr } = await supabase.from('punishments').select('*');
        if (!punErr && punData) {
          setPunishments(punData as Punishment[]);
          localStorage.setItem(STORAGE_KEY_PUNISHMENTS, JSON.stringify(punData));
        }

        const { data: memData } = await supabase.from('members').select('*');
        if (memData) setMembers(memData as Member[]);

        const { data: divData } = await supabase.from('divisions').select('*');
        if (divData) setDivisions(divData as Division[]);

        const { data: evtData } = await supabase.from('events').select('*');
        if (evtData) setEvents(evtData as OrganizationEvent[]);

        const { data: attData } = await supabase.from('attendances').select('*');
        if (attData) setAttendances(attData as Attendance[]);
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

  // Data Kas Januari sampai November dinamis dari item kas yang approved
  const kasMonths: MemberKasMonth[] = useMemo(() => {
    if (!currentMember) return [];

    const rawSubs = localStorage.getItem('gdgoc_kas_submissions');
    const submissions: KasSubmission[] = rawSubs ? JSON.parse(rawSubs) : [];
    const approvedSubIds = new Set(
      submissions.filter((s) => s.status === 'approved').map((s) => s.id)
    );

    const rawItems = localStorage.getItem('gdgoc_kas_items');
    const items: KasSubmissionItem[] = rawItems ? JSON.parse(rawItems) : [];
    const memberItems = items.filter(
      (i) => i.member_id === currentMember.id && i.is_active
    );

    return MONTH_NAMES.map((name, idx) => {
      const monthNum = idx + 1;
      const duesItem = memberItems.find(
        (i) => i.kind === 'dues' && i.month === monthNum
      );
      const isPaid = Boolean(duesItem && approvedSubIds.has(duesItem.submission_id));

      const fineItem = memberItems.find(
        (i) => i.kind === 'fine' && i.month === monthNum
      );
      const hasFine = Boolean(fineItem);
      const isFinePaid = Boolean(fineItem && approvedSubIds.has(fineItem.submission_id));

      return {
        month: monthNum,
        monthName: name,
        isPaid,
        hasFine,
        isFinePaid,
      };
    });
  }, [currentMember]);

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
