import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  BanknotesIcon,
  TrophyIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useMemberDetail } from './data/use-member-detail';
import { CompetitionModalSection } from './sections/CompetitionModalSection';
import { ANIMATIONS } from '@/lib/animations';

export const MemberDetailPage: React.FC = () => {
  const {
    member,
    division,
    isTechnical,
    canRecord,
    eventsAttendance,
    kasMonths,
    competitions,
    isPunishmentRequired,
    isPunishmentCompleted,
    graduationStatus,
    actionError,
    clearActionError,
    addCompetition,
    deleteCompetition,
    togglePunishmentStatus,
  } = useMemberDetail();

  const [isAddCompOpen, setIsAddCompOpen] = useState(false);

  if (!member) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${ANIMATIONS.PAGE_FADE_IN}`}>
        <p className="text-sm text-[#1e1e1e]/60 mb-4">Member tidak ditemukan.</p>
        <Link to="/members">
          <Button variant="outline">Kembali ke Daftar Member</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 ${ANIMATIONS.PAGE_FADE_IN}`}>
      {/* Tombol Navigasi Kembali */}
      <div className="flex items-center gap-3">
        <Link to="/members">
          <Button variant="outline" size="sm" className="flex items-center gap-1.5">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Kembali</span>
          </Button>
        </Link>
        <span className="text-xs text-[#1e1e1e]/40">/ Detail Member</span>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-[#f8d8d8] text-[#ea4335] text-xs font-medium border border-[#ea4335]/20 flex items-center justify-between">
          <span>{actionError}</span>
          <button
            type="button"
            onClick={clearActionError}
            className="text-xs underline hover:text-[#d93025]"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Profil Header Card */}
      <div className="p-6 rounded-2xl border border-[#1e1e1e]/10 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="text-2xl font-semibold text-[#1e1e1e]">{member.full_name}</h1>
            <Badge variant={member.status === 'active' ? 'success' : 'neutral'}>
              {member.status === 'active' ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#1e1e1e]/60">
            <span>{division?.name || 'Belum ada divisi'}</span>
            <span>&bull;</span>
            <Badge variant={isTechnical ? 'info' : 'neutral'}>
              {isTechnical ? 'Technical' : 'Non-Technical'}
            </Badge>
          </div>
        </div>

        {/* Status Kelulusan Sementara */}
        <div className="p-4 rounded-xl border border-[#1e1e1e]/10 bg-[#f0f0f0]/40 flex flex-col gap-1 min-w-[260px]">
          <span className="text-xs font-medium text-[#1e1e1e]/60">Status Kelulusan Sementara</span>
          <div className="flex items-center gap-2">
            <Badge variant={graduationStatus.isGraduated ? 'success' : 'danger'}>
              {graduationStatus.isGraduated ? 'Lulus' : 'Belum Lulus'}
            </Badge>
            <span className="text-xs text-[#1e1e1e]/50">
              ({graduationStatus.attendedCount} hadir, {graduationStatus.absentCount} absen)
            </span>
          </div>
          {graduationStatus.reasons.length > 0 && (
            <div className="mt-2 text-xs text-[#ea4335] flex flex-col gap-1">
              {graduationStatus.reasons.map((reason, idx) => (
                <p key={idx}>&bull; {reason}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bagian Status Punishment (Relevan saat absen > 3 batas toleransi) */}
      <div className="p-5 rounded-2xl border border-[#1e1e1e]/10 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${isPunishmentRequired ? 'bg-[#ffe7a5]/60 text-[#1e1e1e]' : 'bg-[#f0f0f0] text-[#1e1e1e]/60'}`}>
            <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#1e1e1e]">Status Punishment Absensi</span>
              {isPunishmentRequired ? (
                <Badge variant={isPunishmentCompleted ? 'success' : 'danger'}>
                  {isPunishmentCompleted ? 'Sudah Dijalani' : 'Wajib Dijalani'}
                </Badge>
              ) : (
                <Badge variant="neutral">Tidak Diperlukan</Badge>
              )}
            </div>
            <p className="text-xs text-[#1e1e1e]/60 mt-1">
              {isPunishmentRequired
                ? isPunishmentCompleted
                  ? 'Punishment telah diselesaikan oleh member. Kegagalan kelulusan akibat ketidakhadiran telah tertolong.'
                  : 'Jumlah absen melebihi batas aman (3 kali). Member harus menjalani punishment agar tidak gugur kelulusan.'
                : 'Jumlah absensi masih dalam batas toleransi aman (maksimal 3 absen). Punishment tidak dapat diberikan.'}
            </p>
          </div>
        </div>

        {canRecord && isPunishmentRequired && (
          <Button
            type="button"
            variant={isPunishmentCompleted ? 'outline' : 'default'}
            size="sm"
            onClick={togglePunishmentStatus}
            className="shrink-0"
          >
            {isPunishmentCompleted ? 'Tandai Belum Dijalani' : 'Tandai Sudah Dijalani'}
          </Button>
        )}
      </div>

      {/* Grid Informasi Detail */}
      <div className={`grid grid-cols-1 ${isTechnical ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
        {/* Kolom 1: Event & Absensi */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-[#1e1e1e]/10 bg-white">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1e1e1e]/10">
            <CalendarIcon className="w-5 h-5 text-[#4285f4]" />
            <h2 className="text-base font-semibold text-[#1e1e1e]">Riwayat Absensi Event</h2>
          </div>
          <div className="flex flex-col divide-y divide-[#1e1e1e]/10">
            {eventsAttendance.length === 0 ? (
              <p className="text-xs text-[#1e1e1e]/50 py-4 text-center">Belum ada agenda event aktif.</p>
            ) : (
              eventsAttendance.map((evt) => (
                <div key={evt.eventId} className="py-3 flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#1e1e1e]">{evt.eventName}</span>
                    <span className="text-xs text-[#1e1e1e]/50">{evt.eventDate}</span>
                  </div>
                  <div>
                    {!evt.isFinalized ? (
                      <Badge variant="neutral">Belum dicek</Badge>
                    ) : evt.isAttended ? (
                      <Badge variant="success">Hadir</Badge>
                    ) : (
                      <Badge variant="danger">Tidak Hadir</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom 2: Kas (Januari - November) */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-[#1e1e1e]/10 bg-white">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1e1e1e]/10">
            <BanknotesIcon className="w-5 h-5 text-[#34a853]" />
            <h2 className="text-base font-semibold text-[#1e1e1e]">Pembayaran Kas Organisasi</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {kasMonths.map((km) => (
              <div
                key={km.month}
                className="p-2.5 rounded-lg border border-[#1e1e1e]/10 bg-[#f0f0f0]/30 flex flex-col gap-1 text-center"
              >
                <span className="text-xs font-medium text-[#1e1e1e]">{km.monthName}</span>
                <Badge variant={km.isPaid ? 'success' : 'danger'} className="justify-center">
                  {km.isPaid ? 'Lunas' : 'Belum'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom 3: Catatan Lomba (Technical Wajib, Non-Technical Boleh) */}
        {(isTechnical || competitions.length > 0) && (
          <div className="flex flex-col gap-3 p-5 rounded-2xl border border-[#1e1e1e]/10 bg-white">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e1e1e]/10">
              <div className="flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-[#f9ab00]" />
                <h2 className="text-base font-semibold text-[#1e1e1e]">
                  Catatan Lomba {isTechnical && <span className="text-xs font-normal text-[#ea4335]">(Wajib)</span>}
                </h2>
              </div>

              {canRecord && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCompOpen(true)}
                  className="flex items-center gap-1"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </Button>
              )}
            </div>

            <div className="flex flex-col divide-y divide-[#1e1e1e]/10">
              {competitions.length === 0 ? (
                <p className="text-xs text-[#1e1e1e]/50 py-4 text-center">
                  Belum ada catatan lomba yang diikutsertakan.
                </p>
              ) : (
                competitions.map((comp) => (
                  <div key={comp.id} className="py-3 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-[#1e1e1e]">{comp.competition_name}</span>
                      <span className="text-xs text-[#1e1e1e]/60">{comp.organizer}</span>
                    </div>

                    {canRecord && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCompetition(comp.id)}
                        className="text-[#ea4335] hover:bg-[#f8d8d8] h-8 w-8"
                        title="Hapus catatan lomba"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah Lomba */}
      <CompetitionModalSection
        isOpen={isAddCompOpen}
        onClose={() => setIsAddCompOpen(false)}
        onAddCompetition={addCompetition}
      />
    </div>
  );
};
