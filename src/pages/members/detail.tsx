import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, BanknotesIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useMemberDetail } from './data/use-member-detail';
import { ANIMATIONS } from '@/lib/animations';

export const MemberDetailPage: React.FC = () => {
  const {
    member,
    division,
    isTechnical,
    eventsAttendance,
    kasMonths,
    competitions,
    graduationStatus,
  } = useMemberDetail();

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
      </div>

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
        <div className="p-4 rounded-xl border border-[#1e1e1e]/10 bg-[#f0f0f0]/40 flex flex-col gap-1 min-w-[240px]">
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

      {/* Kolom Berdasarkan Divisi (Technical vs Non-Technical) */}
      <div className={`grid grid-cols-1 ${isTechnical ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
        {/* Kolom 1: Event & Absensi */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl border border-[#1e1e1e]/10 bg-white">
          <div className="flex items-center gap-2 pb-3 border-b border-[#1e1e1e]/10">
            <CalendarIcon className="w-5 h-5 text-[#4285f4]" />
            <h2 className="text-base font-semibold text-[#1e1e1e]">Riwayat Absensi Event</h2>
          </div>
          <div className="flex flex-col divide-y divide-[#1e1e1e]/10">
            {eventsAttendance.map((evt) => (
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
            ))}
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

        {/* Kolom 3: Catatan Lomba (Hanya untuk Technical) */}
        {isTechnical && (
          <div className="flex flex-col gap-3 p-5 rounded-2xl border border-[#1e1e1e]/10 bg-white">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1e1e1e]/10">
              <TrophyIcon className="w-5 h-5 text-[#f9ab00]" />
              <h2 className="text-base font-semibold text-[#1e1e1e]">Catatan Lomba (Wajib)</h2>
            </div>
            <div className="flex flex-col divide-y divide-[#1e1e1e]/10">
              {competitions.length === 0 ? (
                <p className="text-xs text-[#1e1e1e]/50 py-4 text-center">
                  Belum ada catatan lomba yang diikutsertakan.
                </p>
              ) : (
                competitions.map((comp) => (
                  <div key={comp.id} className="py-3 flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-[#1e1e1e]">{comp.competitionName}</span>
                    <span className="text-xs text-[#1e1e1e]/60">{comp.organizer}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

