import React, { useState } from 'react';
import type { OrganizationEvent, Member, Division } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/formatters';

interface AttendanceModalSectionProps {
  isOpen: boolean;
  onClose: () => void;
  event: OrganizationEvent | null;
  members: Member[];
  divisions: Division[];
  presentMemberIds: string[];
  onSaveAttendance: (
    eventId: string,
    presentMemberIds: string[],
    markAsFinal: boolean
  ) => Promise<boolean>;
}

interface AttendanceFormContentProps {
  event: OrganizationEvent;
  members: Member[];
  divisions: Division[];
  presentMemberIds: string[];
  onClose: () => void;
  onSaveAttendance: (
    eventId: string,
    presentMemberIds: string[],
    markAsFinal: boolean
  ) => Promise<boolean>;
}

const AttendanceFormContent: React.FC<AttendanceFormContentProps> = ({
  event,
  members,
  divisions,
  presentMemberIds,
  onClose,
  onSaveAttendance,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(presentMemberIds);
  const [isFinal, setIsFinal] = useState<boolean>(event.attendance_finalized);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Ambil hanya member yang aktif
  const activeMembers = members.filter((m) => m.status === 'active');

  const toggleMemberPresence = (memberId: string) => {
    setSelectedIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === activeMembers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activeMembers.map((m) => m.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await onSaveAttendance(event.id, selectedIds, isFinal);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const getDivisionName = (divisionId: string): string => {
    return divisions.find((d) => d.id === divisionId)?.name || '-';
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <DialogTitle>Pencatatan Presensi Event</DialogTitle>
          <Badge variant={event.type === 'online' ? 'info' : 'warning'}>
            {event.type === 'online' ? 'Online' : 'Offline'}
          </Badge>
        </div>
        <DialogDescription>
          {event.name} &bull; {formatDate(event.event_date)}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
        {/* Bar Kontrol Checklist */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0f0f0]/40 border border-[#1e1e1e]/10">
          <span className="text-xs text-[#1e1e1e]">
            Kehadiran: <strong className="text-[#34a853]">{selectedIds.length}</strong> hadir dari {activeMembers.length} member aktif
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedIds.length === activeMembers.length ? 'Batal Semua' : 'Pilih Semua Hadir'}
          </Button>
        </div>

        {/* Daftar Member Aktif dengan Checkbox */}
        <div className="max-h-72 overflow-y-auto divide-y divide-[#1e1e1e]/10 border border-[#1e1e1e]/10 rounded-xl bg-white">
          {activeMembers.length === 0 ? (
            <p className="p-4 text-center text-xs text-[#1e1e1e]/50">
              Tidak ada member berstatus aktif.
            </p>
          ) : (
            activeMembers.map((member) => {
              const isChecked = selectedIds.includes(member.id);

              return (
                <label
                  key={member.id}
                  className="flex items-center justify-between p-3 hover:bg-[#f0f0f0]/30 transition-colors cursor-pointer select-none"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#1e1e1e]">
                      {member.full_name}
                    </span>
                    <span className="text-xs text-[#1e1e1e]/60">
                      {getDivisionName(member.division_id)}
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleMemberPresence(member.id)}
                    className="w-4 h-4 rounded text-[#4285f4] focus:ring-[#4285f4] border-[#1e1e1e]/20"
                  />
                </label>
              );
            })
          )}
        </div>

        {/* Opsi Finalisasi Absensi */}
        <div className="p-3.5 rounded-xl border border-[#1e1e1e]/10 bg-white flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[#1e1e1e]">Tandai Absensi Final</span>
            <span className="text-[11px] text-[#1e1e1e]/60">
              Absensi baru dihitung ke rekap dan detail member setelah status ini diaktifkan.
            </span>
          </div>

          <input
            type="checkbox"
            id="finalize-attendance"
            checked={isFinal}
            onChange={(e) => setIsFinal(e.target.checked)}
            className="w-4 h-4 rounded text-[#4285f4] focus:ring-[#4285f4] border-[#1e1e1e]/20"
          />
        </div>

        {/* Aksi Bawah */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e1e1e]/10">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Absensi'}
          </Button>
        </div>
      </form>
    </>
  );
};

export const AttendanceModalSection: React.FC<AttendanceModalSectionProps> = ({
  isOpen,
  onClose,
  event,
  members,
  divisions,
  presentMemberIds,
  onSaveAttendance,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        {event && (
          <AttendanceFormContent
            key={event.id}
            event={event}
            members={members}
            divisions={divisions}
            presentMemberIds={presentMemberIds}
            onClose={onClose}
            onSaveAttendance={onSaveAttendance}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
