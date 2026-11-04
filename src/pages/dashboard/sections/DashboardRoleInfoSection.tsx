import React from 'react';
import type { UserRole } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface DashboardRoleInfoSectionProps {
  role: UserRole | null;
}

export const DashboardRoleInfoSection: React.FC<DashboardRoleInfoSectionProps> = ({
  role,
}) => {
  const getRoleDetails = (r: UserRole | null) => {
    switch (r) {
      case 'superadmin':
        return {
          title: 'Superadmin (Leader)',
          desc: 'Memiliki wewenang penuh atas seluruh operasional organisasi: pengelolaan divisi, pendaftaran member, presensi event, pengelolaan kas, dan pelacak kerja.',
          accessibleMenus: ['Dashboard', 'Member', 'Event', 'Kas'],
        };
      case 'admin':
        return {
          title: 'Admin Organisasi',
          desc: 'Bertanggung jawab atas data keanggotaan, pencatatan absensi event kegiatan, sertifikasi lomba member, dan punishment absensi.',
          accessibleMenus: ['Dashboard', 'Member', 'Event'],
        };
      case 'executive':
        return {
          title: 'Executive (Treasurer)',
          desc: 'Bertanggung jawab penuh atas tata kelola keuangan organisasi: verifikasi struk bukti bayar kas, denda, dan pengeluaran.',
          accessibleMenus: ['Dashboard', 'Kas'],
        };
      case 'po':
        return {
          title: 'Project Officer (PO)',
          desc: 'Bertanggung jawab atas inisiasi dan pelaksanaan event batch serta pengelolaan lembar kerja tracker divisi kepanitiaan.',
          accessibleMenus: ['Dashboard', 'Event'],
        };
      default:
        return {
          title: 'Pengguna',
          desc: 'Akses terbatas.',
          accessibleMenus: ['Dashboard'],
        };
    }
  };

  const details = getRoleDetails(role);

  return (
    <div className="p-6 rounded-2xl border border-[#1e1e1e]/10 bg-white flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <ShieldCheckIcon className="w-5 h-5 text-[#4285f4]" />
        <h2 className="text-base font-semibold text-[#1e1e1e]">
          Wewenang Akun Jabatan: {details.title}
        </h2>
      </div>

      <p className="text-xs text-[#1e1e1e]/70 leading-relaxed max-w-3xl">
        {details.desc}
      </p>

      <div className="flex items-center gap-2 pt-2 border-t border-[#1e1e1e]/10 mt-1">
        <span className="text-xs text-[#1e1e1e]/60 font-medium">Menu Aktif:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {details.accessibleMenus.map((m) => (
            <Badge key={m} variant="info">
              {m}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

