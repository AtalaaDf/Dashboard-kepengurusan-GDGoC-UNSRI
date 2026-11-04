import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Division, Member } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';

interface MemberListSectionProps {
  members: Member[];
  divisions: Division[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedDivisionFilter: string;
  onDivisionFilterChange: (value: string) => void;
  selectedStatusFilter: 'all' | 'active' | 'inactive';
  onStatusFilterChange: (value: 'all' | 'active' | 'inactive') => void;
  isSuperadmin: boolean;
  onToggleStatus: (memberId: string) => void;
  onDeleteMember: (memberId: string) => Promise<boolean>;
  getDivisionById: (id: string) => Division | undefined;
}

export const MemberListSection: React.FC<MemberListSectionProps> = ({
  members,
  divisions,
  searchQuery,
  onSearchChange,
  selectedDivisionFilter,
  onDivisionFilterChange,
  selectedStatusFilter,
  onStatusFilterChange,
  isSuperadmin,
  onToggleStatus,
  onDeleteMember,
  getDivisionById,
}) => {
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    await onDeleteMember(memberToDelete.id);
    setIsDeleting(false);
    setMemberToDelete(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e1e1e]/40" />
          <Input
            type="text"
            placeholder="Cari nama member..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Divisi */}
          <select
            value={selectedDivisionFilter}
            onChange={(e) => onDivisionFilterChange(e.target.value)}
            className="min-h-[40px] px-3 py-2 rounded-lg border border-[#1e1e1e]/20 bg-white text-sm text-[#1e1e1e] outline-none focus:ring-2 focus:ring-[#4285f4]/30"
          >
            <option value="all">Semua Divisi</option>
            {divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.name}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
            className="min-h-[40px] px-3 py-2 rounded-lg border border-[#1e1e1e]/20 bg-white text-sm text-[#1e1e1e] outline-none focus:ring-2 focus:ring-[#4285f4]/30"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif Saja</option>
            <option value="inactive">Nonaktif Saja</option>
          </select>
        </div>
      </div>

      {/* Tabel Member */}
      <div className="border border-[#1e1e1e]/10 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1e1e1e]/10 bg-[#f0f0f0]/50 text-[#1e1e1e]/70 font-medium">
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Divisi</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e1e]/10">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#1e1e1e]/60">
                    Belum ada data member yang sesuai filter.
                  </td>
                </tr>
              ) : (
                members.map((member) => {
                  const division = getDivisionById(member.division_id);
                  const isTechnical = division?.type === 'technical';
                  const isActive = member.status === 'active';

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-[#f0f0f0]/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-[#1e1e1e]">
                        {member.full_name}
                      </td>
                      <td className="py-3.5 px-4 text-[#1e1e1e]/80">
                        {division?.name || 'Tanpa Divisi'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isTechnical ? 'info' : 'neutral'}>
                          {isTechnical ? 'Technical' : 'Non-Technical'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isActive ? 'success' : 'neutral'}>
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <Link to={`/members/${member.id}`}>
                            <Button variant="outline" size="sm">
                              Detail
                            </Button>
                          </Link>

                          {isSuperadmin && (
                            <>
                              <Button
                                variant={isActive ? 'ghost' : 'secondary'}
                                size="sm"
                                onClick={() => onToggleStatus(member.id)}
                                className={isActive ? 'text-[#ea4335] hover:bg-[#f8d8d8]' : 'text-[#34a853] hover:bg-[#ccf6c5]'}
                              >
                                {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                              </Button>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setMemberToDelete(member)}
                                className="h-8 w-8 text-[#ea4335] hover:bg-[#f8d8d8]"
                                title="Hapus member permanen"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Konfirmasi Hapus Member */}
      <Dialog open={Boolean(memberToDelete)} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Data Member</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data member <strong>{memberToDelete?.full_name}</strong>? Tindakan ini akan menghapus riwayat keanggotaan dan catatan terkait dari sistem.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e1e1e]/10 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMemberToDelete(null)}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
