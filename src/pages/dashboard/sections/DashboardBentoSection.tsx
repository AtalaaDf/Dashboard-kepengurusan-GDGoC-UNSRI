import React from 'react';
import type { DashboardMetrics } from '../data/use-dashboard';
import {
  BanknotesIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  SquaresPlusIcon,
} from '@heroicons/react/24/outline';

interface DashboardBentoSectionProps {
  metrics: DashboardMetrics;
}

export const DashboardBentoSection: React.FC<DashboardBentoSectionProps> = ({
  metrics,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Kartu 1: Saldo Kas Organisasi (Melebar 2 kolom di desktop lg) */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-[#ccf6c5]/50 border border-[#34a853]/25 flex flex-col justify-between min-h-[160px] transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#34a853]">
            <BanknotesIcon className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Saldo Kas Organisasi
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#1e1e1e]/50 bg-white/70 px-2 py-0.5 rounded-full">
            Realtime
          </span>
        </div>

        <div className="my-2">
          <p className="text-3xl sm:text-4xl font-semibold text-[#1e1e1e] tracking-tight">
            {metrics.cashBalance}
          </p>
          <p className="text-xs text-[#1e1e1e]/60 mt-1">
            Total penerimaan iuran dan denda yang telah diverifikasi dikurangi pengeluaran.
          </p>
        </div>
      </div>

      {/* Kartu 2: Member Aktif */}
      <div className="p-6 rounded-2xl bg-[#c3ecf6]/50 border border-[#4285f4]/25 flex flex-col justify-between min-h-[160px] transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#4285f4]">
            <UserGroupIcon className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Member Aktif
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#1e1e1e]/50 bg-white/70 px-2 py-0.5 rounded-full">
            Batch
          </span>
        </div>

        <div className="my-2">
          <p className="text-3xl sm:text-4xl font-semibold text-[#1e1e1e] tracking-tight">
            {metrics.activeMembersCount}
          </p>
          <p className="text-xs text-[#1e1e1e]/60 mt-1">
            Anggota aktif dari {metrics.totalMembersCount} total anggota terdaftar.
          </p>
        </div>
      </div>

      {/* Kartu 3: Event Terlaksana */}
      <div className="p-6 rounded-2xl bg-[#ffe7a5]/50 border border-[#f9ab00]/30 flex flex-col justify-between min-h-[160px] transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#f9ab00]">
            <CalendarDaysIcon className="w-5 h-5 text-[#1e1e1e]" />
            <span className="text-xs font-semibold tracking-wide uppercase text-[#1e1e1e]">
              Event Terlaksana
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#1e1e1e]/50 bg-white/70 px-2 py-0.5 rounded-full">
            Final
          </span>
        </div>

        <div className="my-2">
          <p className="text-3xl sm:text-4xl font-semibold text-[#1e1e1e] tracking-tight">
            {metrics.completedEventsCount}
          </p>
          <p className="text-xs text-[#1e1e1e]/60 mt-1">
            Kegiatan dengan absensi telah ditandai final dalam batch ini.
          </p>
        </div>
      </div>

      {/* Kartu 4: Jumlah Divisi */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-[#f8d8d8]/50 border border-[#ea4335]/25 flex flex-col justify-between min-h-[160px] transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#ea4335]">
            <SquaresPlusIcon className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              Divisi Organisasi
            </span>
          </div>
          <span className="text-[11px] font-medium text-[#1e1e1e]/50 bg-white/70 px-2 py-0.5 rounded-full">
            Struktur
          </span>
        </div>

        <div className="my-2">
          <p className="text-3xl sm:text-4xl font-semibold text-[#1e1e1e] tracking-tight">
            {metrics.divisionsCount}
          </p>
          <p className="text-xs text-[#1e1e1e]/60 mt-1">
            Kombinasi divisi technical (wajib lomba) dan non-technical.
          </p>
        </div>
      </div>
    </div>
  );
};

