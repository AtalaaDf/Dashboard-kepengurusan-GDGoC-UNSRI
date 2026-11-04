import type {
  Member,
  Division,
  OrganizationEvent,
  Attendance,
  CompetitionEntry,
  Punishment,
  KasSubmission,
  KasSubmissionItem,
} from '@/types';
import { exportToSpreadsheet } from './export-spreadsheet';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November'
];

function sortMembersByDivisionCategory(members: Member[], divisions: Division[]): Member[] {
  const divMap = new Map<string, Division>(divisions.map((d) => [d.id, d]));

  return [...members].sort((a, b) => {
    const divA = divMap.get(a.division_id);
    const divB = divMap.get(b.division_id);
    const catOrder = (d?: Division) => {
      if (!d) return 2;
      return d.type === 'non_technical' ? 0 : 1;
    };

    const catA = catOrder(divA);
    const catB = catOrder(divB);

    if (catA !== catB) {
      return catA - catB;
    }
    const divNameA = divA?.name || '';
    const divNameB = divB?.name || '';
    const divComp = divNameA.localeCompare(divNameB, 'id');
    if (divComp !== 0) {
      return divComp;
    }
    return a.full_name.localeCompare(b.full_name, 'id');
  });
}

export function downloadAttendanceAndGraduationRecap(): void {
  const rawMembers = localStorage.getItem('gdgoc_members_data');
  const members: Member[] = rawMembers ? JSON.parse(rawMembers) : [];

  const rawDivisions = localStorage.getItem('gdgoc_divisions_data');
  const divisions: Division[] = rawDivisions ? JSON.parse(rawDivisions) : [];

  const sortedMembers = sortMembersByDivisionCategory(members, divisions);

  const rawEvents = localStorage.getItem('gdgoc_events_data');
  const events: OrganizationEvent[] = rawEvents ? JSON.parse(rawEvents) : [];
  const finalizedEvents = events.filter((e) => e.attendance_finalized && e.status === 'active');

  const rawAttendances = localStorage.getItem('gdgoc_attendances_data');
  const attendances: Attendance[] = rawAttendances ? JSON.parse(rawAttendances) : [];

  const rawComps = localStorage.getItem('gdgoc_competitions_data');
  const competitions: CompetitionEntry[] = rawComps ? JSON.parse(rawComps) : [];

  const rawPuns = localStorage.getItem('gdgoc_punishments_data');
  const punishments: Punishment[] = rawPuns ? JSON.parse(rawPuns) : [];

  const rawSubs = localStorage.getItem('gdgoc_kas_submissions');
  const submissions: KasSubmission[] = rawSubs ? JSON.parse(rawSubs) : [];
  const approvedSubIds = new Set(
    submissions.filter((s) => s.status === 'approved').map((s) => s.id)
  );

  const rawItems = localStorage.getItem('gdgoc_kas_items');
  const items: KasSubmissionItem[] = rawItems ? JSON.parse(rawItems) : [];

  const headers = [
    'Nama Member',
    'Divisi',
    'Kategori',
    'Jumlah Hadir',
    'Jumlah Absen',
    'Catatan Lomba (Technical)',
    'Status Punishment',
    'Status Kelulusan',
    'Alasan Belum Lulus',
  ];

  const rows = sortedMembers.map((member) => {
    const division = divisions.find((d) => d.id === member.division_id);
    const isTechnical = division?.type === 'technical';

    // 1. Hitung Kehadiran
    const attendedCount = finalizedEvents.filter((evt) =>
      attendances.some((a) => a.event_id === evt.id && a.member_id === member.id)
    ).length;
    const absentCount = finalizedEvents.length - attendedCount;

    // 2. Lomba
    const memberComps = competitions.filter((c) => c.member_id === member.id);
    const compText = memberComps.length > 0
      ? memberComps.map((c) => `${c.competition_name} (${c.organizer})`).join('; ')
      : isTechnical
      ? 'Belum ada lomba'
      : '-';

    // 3. Punishment
    const pun = punishments.find((p) => p.member_id === member.id);
    const isPunRequired = absentCount > 3;
    const punStatusText = !isPunRequired
      ? 'Tidak Diperlukan'
      : pun?.is_completed
      ? 'Sudah Dijalani'
      : 'Belum Dijalani';

    // 4. Kelulusan
    const reasons: string[] = [];

    // Cek Kas
    const memberItems = items.filter((i) => i.member_id === member.id && i.is_active);
    const unpaidMonthsCount = 11 - memberItems.filter(
      (i) => i.kind === 'dues' && approvedSubIds.has(i.submission_id)
    ).length;

    if (unpaidMonthsCount > 0) {
      reasons.push(`Iuran belum lunas (${unpaidMonthsCount} bulan bolong)`);
    }

    if (absentCount > 3 && !pun?.is_completed) {
      reasons.push(`Absen (${absentCount}) melebihi batas 3 kali`);
    }

    if (isTechnical && memberComps.length === 0) {
      reasons.push('Wajib mengikuti minimal 1 lomba');
    }

    const isGraduated = reasons.length === 0;

    return [
      member.full_name,
      division?.name || '-',
      isTechnical ? 'Technical' : 'Non-Technical',
      attendedCount,
      absentCount,
      compText,
      punStatusText,
      isGraduated ? 'LULUS' : 'BELUM LULUS',
      reasons.join(' | ') || '-',
    ];
  });

  const timestamp = new Date().toISOString().split('T')[0];
  exportToSpreadsheet(`rekap_absensi_dan_kelulusan_gdgoc_${timestamp}.csv`, headers, rows);
}

export function downloadCashRecap(): void {
  const rawMembers = localStorage.getItem('gdgoc_members_data');
  const members: Member[] = rawMembers ? JSON.parse(rawMembers) : [];

  const rawDivisions = localStorage.getItem('gdgoc_divisions_data');
  const divisions: Division[] = rawDivisions ? JSON.parse(rawDivisions) : [];

  const sortedMembers = sortMembersByDivisionCategory(members, divisions);

  const rawSubs = localStorage.getItem('gdgoc_kas_submissions');
  const submissions: KasSubmission[] = rawSubs ? JSON.parse(rawSubs) : [];
  const approvedSubIds = new Set(
    submissions.filter((s) => s.status === 'approved').map((s) => s.id)
  );

  const rawItems = localStorage.getItem('gdgoc_kas_items');
  const items: KasSubmissionItem[] = rawItems ? JSON.parse(rawItems) : [];

  const headers = [
    'Nama Member',
    'Divisi',
    ...MONTH_NAMES,
    'Jumlah Bulan Bolong',
    'Sisa Denda (Rp)',
    'Status Kas',
    'Keterangan',
  ];

  const rows = sortedMembers.map((member) => {
    const division = divisions.find((d) => d.id === member.division_id);
    const memberItems = items.filter((i) => i.member_id === member.id && i.is_active);

    const monthStatuses: string[] = [];
    let bolongCount = 0;

    MONTH_NAMES.forEach((_, idx) => {
      const monthNum = idx + 1;
      const duesItem = memberItems.find(
        (i) => i.kind === 'dues' && i.month === monthNum && approvedSubIds.has(i.submission_id)
      );

      if (duesItem) {
        monthStatuses.push('Lunas');
      } else {
        monthStatuses.push('Belum Lunas');
        bolongCount++;
      }
    });

    const unpaidFines = memberItems.filter(
      (i) => i.kind === 'fine' && !approvedSubIds.has(i.submission_id)
    );
    const totalRemainingFine = unpaidFines.length * 3000;

    const isCashComplete = bolongCount === 0 && totalRemainingFine === 0;

    return [
      member.full_name,
      division?.name || '-',
      ...monthStatuses,
      bolongCount,
      totalRemainingFine,
      isCashComplete ? 'Lunas Penuh' : 'Menunggak',
      bolongCount > 0
        ? `Kurang ${bolongCount} bulan iuran`
        : totalRemainingFine > 0
        ? `Sisa denda Rp${totalRemainingFine.toLocaleString('id-ID')}`
        : 'Semua kewajiban kas terpenuhi',
    ];
  });

  const timestamp = new Date().toISOString().split('T')[0];
  exportToSpreadsheet(`rekap_kas_organisasi_gdgoc_${timestamp}.csv`, headers, rows);
}
