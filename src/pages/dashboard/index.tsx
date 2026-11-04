import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/data/auth/auth-context';
import { ANIMATIONS } from '@/lib/animations';
import type { Member, Division, OrganizationEvent } from '@/types';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();
  const canReviewCash = role === 'superadmin' || role === 'executive';

  const stats = useMemo(() => {
    const rawMembers = localStorage.getItem('gdgoc_members_data');
    const members: Member[] = rawMembers ? JSON.parse(rawMembers) : [];
    const activeMembers = members.filter((m) => m.status === 'active').length;

    const rawDivisions = localStorage.getItem('gdgoc_divisions_data');
    const divisions: Division[] = rawDivisions ? JSON.parse(rawDivisions) : [];

    const rawEvents = localStorage.getItem('gdgoc_events_data');
    const events: OrganizationEvent[] = rawEvents ? JSON.parse(rawEvents) : [];
    const completedEvents = events.filter(
      (e) => e.attendance_finalized && e.status === 'active'
    ).length;

    return {
      cashBalance: 'Rp2.450.000',
      activeMembers,
      completedEvents,
      divisionsCount: divisions.length,
      pendingPaymentsCount: 3,
    };
  }, []);

  return (
    <div className={`flex flex-col gap-8 ${ANIMATIONS.PAGE_FADE_IN}`}>
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1e1e1e]">Dashboard</h1>
          <p className="text-sm text-[#1e1e1e]/60 mt-1">
            Ringkasan data organisasi GDGoC UNSRI
          </p>
        </div>

        {/* Notifikasi Kas Pending untuk Superadmin dan Executive */}
        {canReviewCash && (
          <Link
            to="/cash"
            className="self-start sm:self-auto flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-[#1e1e1e]/10 bg-white hover:bg-[#f0f0f0] transition-colors"
            title="Pembayaran kas pending"
          >
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 text-[#1e1e1e]" />
              {stats.pendingPaymentsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#ea4335] rounded-full ring-2 ring-white" />
              )}
            </div>
            <span className="text-xs font-medium text-[#1e1e1e]">
              {stats.pendingPaymentsCount} pembayaran menunggu
            </span>
          </Link>
        )}
      </div>

      {/* Bento Grid 4 Angka Acuan (desain.md Bab 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kartu 1: Saldo Kas */}
        <div className="p-6 rounded-2xl bg-[#ccf6c5]/50 border border-[#34a853]/20 flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-medium text-[#1e1e1e]/70">Total Saldo Kas</span>
          <div>
            <p className="text-3xl font-semibold text-[#1e1e1e] tracking-tight">
              {stats.cashBalance}
            </p>
            <p className="text-xs text-[#34a853] mt-1 font-medium">Berdasarkan data kas aktif</p>
          </div>
        </div>

        {/* Kartu 2: Member Aktif */}
        <div className="p-6 rounded-2xl bg-[#c3ecf6]/50 border border-[#4285f4]/20 flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-medium text-[#1e1e1e]/70">Member Aktif</span>
          <div>
            <p className="text-3xl font-semibold text-[#1e1e1e] tracking-tight">
              {stats.activeMembers}
            </p>
            <p className="text-xs text-[#4285f4] mt-1 font-medium">Dalam batch berjalan</p>
          </div>
        </div>

        {/* Kartu 3: Event Dilaksanakan */}
        <div className="p-6 rounded-2xl bg-[#ffe7a5]/50 border border-[#f9ab00]/20 flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-medium text-[#1e1e1e]/70">Event Terlaksana</span>
          <div>
            <p className="text-3xl font-semibold text-[#1e1e1e] tracking-tight">
              {stats.completedEvents}
            </p>
            <p className="text-xs text-[#1e1e1e]/70 mt-1 font-medium">Absensi telah final</p>
          </div>
        </div>

        {/* Kartu 4: Divisi */}
        <div className="p-6 rounded-2xl bg-[#f8d8d8]/50 border border-[#ea4335]/20 flex flex-col justify-between min-h-[140px]">
          <span className="text-xs font-medium text-[#1e1e1e]/70">Jumlah Divisi</span>
          <div>
            <p className="text-3xl font-semibold text-[#1e1e1e] tracking-tight">
              {stats.divisionsCount}
            </p>
            <p className="text-xs text-[#ea4335] mt-1 font-medium">Technical & Non-Technical</p>
          </div>
        </div>
      </div>

      {/* Informasi Peran Aktif */}
      <div className="p-6 rounded-2xl border border-[#1e1e1e]/10 bg-white">
        <h2 className="text-base font-semibold text-[#1e1e1e]">Status Akun Jabatan</h2>
        <p className="text-sm text-[#1e1e1e]/70 mt-1">
          Saat ini Anda sedang masuk dengan peran{' '}
          <span className="font-semibold text-[#4285f4] capitalize">{role}</span>.
        </p>
      </div>
    </div>
  );
};
