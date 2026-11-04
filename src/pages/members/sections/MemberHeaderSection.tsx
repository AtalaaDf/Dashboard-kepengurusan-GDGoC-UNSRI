import React from 'react';
import { Button } from '@/components/ui/Button';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';

interface MemberHeaderSectionProps {
  isSuperadmin: boolean;
  onOpenAddMember: () => void;
  onOpenManageDivisions: () => void;
  totalMembersCount: number;
  activeMembersCount: number;
}

export const MemberHeaderSection: React.FC<MemberHeaderSectionProps> = ({
  isSuperadmin,
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

      {isSuperadmin && (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onOpenManageDivisions}
            className="flex items-center gap-2"
          >
            <FolderIcon className="w-4 h-4" />
            <span>Kelola Divisi</span>
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={onOpenAddMember}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Tambah Member</span>
          </Button>
        </div>
      )}
    </div>
  );
};

