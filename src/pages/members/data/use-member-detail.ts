import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { Division, Member, OrganizationEvent, Attendance } from '@/types';

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

export interface CompetitionEntry {
  id: string;
  competitionName: string;
  organizer: string;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November'
];

export function useMemberDetail() {
  const { id } = useParams<{ id: string }>();

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

  const currentMember = useMemo(() => {
    return members.find((m) => m.id === id);
  }, [members, id]);

  const currentDivision = useMemo(() => {
    if (!currentMember) return undefined;
    return divisions.find((d) => d.id === currentMember.division_id);
  }, [divisions, currentMember]);

  const isTechnical = currentDivision?.type === 'technical';

  // Data absensi dinamis dari daftar event aktif
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

  // Catatan Lomba (untuk Technical)
  const competitions: CompetitionEntry[] = useMemo(() => {
    if (!isTechnical) return [];
    return [
      {
        id: 'comp-1',
        competitionName: 'Hackathon Nasional Gemastik 2026',
        organizer: 'Puspresnas Kemendikbud',
      },
    ];
  }, [isTechnical]);

  // Punishment status
  const punishment = useMemo(() => {
    return {
      hasPunishment: false,
      isCompleted: false,
    };
  }, []);

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

    // 2. Absensi: Hanya event berstatus attendance_finalized yang dihitung
    const finalizedEvents = eventsAttendance.filter((e) => e.isFinalized);
    const absentCount = finalizedEvents.filter((e) => !e.isAttended).length;
    const maxAbsences = 3;

    if (absentCount > maxAbsences && !punishment.isCompleted) {
      reasons.push(
        `Jumlah absen (${absentCount}) melebihi batas toleransi (${maxAbsences}) dan punishment belum diselesaikan`
      );
    }

    // 3. Lomba (khusus technical)
    if (isTechnical && competitions.length === 0) {
      reasons.push('Member technical wajib mengikuti minimal 1 lomba');
    }

    const isGraduated = reasons.length === 0;

    return {
      isGraduated,
      reasons,
      absentCount,
      attendedCount: finalizedEvents.filter((e) => e.isAttended).length,
    };
  }, [kasMonths, eventsAttendance, isTechnical, competitions, punishment]);

  return {
    member: currentMember,
    division: currentDivision,
    isTechnical,
    eventsAttendance,
    kasMonths,
    competitions,
    punishment,
    graduationStatus,
  };
}
