import React from 'react';
import { Button } from '@/components/ui/Button';
import { PlusIcon, FolderIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { downloadAttendanceAndGraduationRecap } from '@/lib/recap-generator';

interface MemberHeaderSectionProps {
  isSuperadmin: boolean;
  canDownloadRecap: boolean;
  onOpenAddMember: () => void;
  onOpenManageDivisions: () => void;
  totalMembersCount: number;
  activeMembersCount: number;
}

export const MemberHeaderSection: React.FC<MemberHeaderSectionProps> = ({
  isSuperadmin,
  canDownloadRecap,
  onOpenAddMember,
  onOpenManageDivisions,
  totalMembersCount,
  activeMembersCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1e1e1e]/10">
      <div>
        <h1 className="text-2xl font-semibold text-[#1e1e1e]">Member & Divisi</h1>
        <p className="text-sm text-[#1e1e1e]/60 mt-1">
          Kelola data anggota dan divisi organisasi ({activeMembersCount} aktif dari {totalMembersCount} total)
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {canDownloadRecap && (
          <Button
            type="button"
            variant="outline"
            onClick={downloadAttendanceAndGraduationRecap}
            className="flex items-center gap-1.5 text-xs"
            title="Unduh rekap absensi dan kelulusan CSV"
          >
            <ArrowDownTrayIcon className="w-4 h-4 text-[#4285f4]" />
            <span>Unduh Rekap</span>
          </Button>
        )}

        {isSuperadmin && (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={onOpenManageDivisions}
              className="flex items-center gap-1.5 text-xs"
            >
              <FolderIcon className="w-4 h-4" />
              <span>Kelola Divisi</span>
            </Button>

            <Button
              type="button"
              variant="default"
              onClick={onOpenAddMember}
              className="flex items-center gap-1.5 text-xs"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Tambah Member</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
