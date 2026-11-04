import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { OrganizationEvent, TrackerTask } from '@/types';
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
import { formatDate } from '@/lib/formatters';
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  TrashIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

interface EventListSectionProps {
  events: OrganizationEvent[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTypeFilter: string;
  onTypeFilterChange: (value: string) => void;
  selectedStatusFilter: string;
  onStatusFilterChange: (value: string) => void;
  canRecordAttendance: boolean;
  canManageEvents: boolean;
  onOpenAttendance: (event: OrganizationEvent) => void;
  onDeleteEvent: (eventId: string) => Promise<boolean>;
}

export const EventListSection: React.FC<EventListSectionProps> = ({
  events,
  searchQuery,
  onSearchChange,
  selectedTypeFilter,
  onTypeFilterChange,
  selectedStatusFilter,
  onStatusFilterChange,
  canRecordAttendance,
  canManageEvents,
  onOpenAttendance,
  onDeleteEvent,
}) => {
  const [eventToDelete, setEventToDelete] = useState<OrganizationEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Hitung persentase tugas tracker per event
  const allTasks: TrackerTask[] = useMemo(() => {
    try {
      const raw = localStorage.getItem('gdgoc_tracker_tasks');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const getEventProgress = (eventId: string): number => {
    try {
      const rawDivs = localStorage.getItem('gdgoc_tracker_divisions');
      const divs = rawDivs ? JSON.parse(rawDivs) : [];
      const eventDivIds = new Set(
        divs.filter((d: { event_id: string }) => d.event_id === eventId).map((d: { id: string }) => d.id)
      );

      const rawGrps = localStorage.getItem('gdgoc_tracker_groups');
      const grps = rawGrps ? JSON.parse(rawGrps) : [];
      const eventGrpIds = new Set(
        grps
          .filter((g: { tracker_division_id: string }) => eventDivIds.has(g.tracker_division_id))
          .map((g: { id: string }) => g.id)
      );

      const eventTasks = allTasks.filter((t) => eventGrpIds.has(t.group_id) && t.status !== 'cancelled');
      if (eventTasks.length === 0) return 0;
      const doneTasks = eventTasks.filter((t) => t.status === 'done');
      return Math.round((doneTasks.length / eventTasks.length) * 100);
    } catch {
      return 0;
    }
  };

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    await onDeleteEvent(eventToDelete.id);
    setIsDeleting(false);
    setEventToDelete(null);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e1e1e]/40" />
          <Input
            type="text"
            placeholder="Cari nama event..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedTypeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="min-h-[40px] px-3 py-2 rounded-lg border border-[#1e1e1e]/20 bg-white text-sm text-[#1e1e1e] outline-none focus:ring-2 focus:ring-[#4285f4]/30"
          >
            <option value="all">Semua Tipe</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="min-h-[40px] px-3 py-2 rounded-lg border border-[#1e1e1e]/20 bg-white text-sm text-[#1e1e1e] outline-none focus:ring-2 focus:ring-[#4285f4]/30"
          >
            <option value="all">Semua Status</option>
            <option value="finalized">Absensi Final</option>
            <option value="unfinalized">Belum Dicek</option>
          </select>
        </div>
      </div>

      {/* Grid Kartu Event */}
      {events.length === 0 ? (
        <div className="p-12 text-center border border-[#1e1e1e]/10 rounded-2xl bg-white text-[#1e1e1e]/60 text-sm">
          Belum ada event yang sesuai kriteria pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => {
            const isFinalized = evt.attendance_finalized;
            const progress = getEventProgress(evt.id);

            return (
              <div
                key={evt.id}
                className="p-5 rounded-2xl border border-[#1e1e1e]/10 bg-white flex flex-col justify-between gap-4 hover:border-[#1e1e1e]/20 transition-colors"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={evt.type === 'online' ? 'info' : 'warning'}>
                      {evt.type === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                    <Badge variant={isFinalized ? 'success' : 'neutral'}>
                      {isFinalized ? 'Absensi Final' : 'Belum dicek'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-semibold text-[#1e1e1e] line-clamp-2">
                    {evt.name}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-[#1e1e1e]/60">
                    <div className="flex items-center gap-1.5">
                      <CalendarDaysIcon className="w-4 h-4 shrink-0" />
                      <span>{formatDate(evt.event_date)}</span>
                    </div>

                    <span className="font-medium text-[#34a853]">
                      {progress}% tracker selesai
                    </span>
                  </div>
                </div>

                {/* Aksi Event */}
                <div className="pt-3 border-t border-[#1e1e1e]/10 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {canRecordAttendance && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenAttendance(evt)}
                        className="flex items-center gap-1.5"
                      >
                        <CheckBadgeIcon className="w-4 h-4 text-[#4285f4]" />
                        <span>Absensi</span>
                      </Button>
                    )}

                    <Link to={`/events/${evt.id}/tracker`}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1.5"
                      >
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-[#1e1e1e]" />
                        <span>Tracker</span>
                      </Button>
                    </Link>
                  </div>

                  {canManageEvents && (
                    <button
                      type="button"
                      onClick={() => setEventToDelete(evt)}
                      className="ml-auto text-xs text-[#ea4335] hover:bg-[#f8d8d8] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0 outline-none focus:ring-2 focus:ring-[#ea4335]/30 cursor-pointer"
                      title="Hapus event permanen"
                    >
                      <TrashIcon className="w-3.5 h-3.5 shrink-0 stroke-[#ea4335] text-[#ea4335]" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog Konfirmasi Hapus Event */}
      <Dialog open={Boolean(eventToDelete)} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hapus Event Organisasi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus event <strong>{eventToDelete?.name}</strong>? Seluruh lembar kerja tracker divisi dan riwayat presensi terkait event ini akan dihapus permanen dari sistem.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e1e1e]/10 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEventToDelete(null)}
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
              {isDeleting ? 'Menghapus...' : 'Ya, Hapus Event'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
