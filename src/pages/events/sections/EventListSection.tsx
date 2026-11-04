import React from 'react';
import type { OrganizationEvent } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/formatters';
import {
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  XCircleIcon,
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
  onCancelEvent: (eventId: string) => void;
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
  onCancelEvent,
}) => {
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
            <option value="active">Aktif</option>
            <option value="cancelled">Dibatalkan</option>
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
            const isCancelled = evt.status === 'cancelled';
            const isFinalized = evt.attendance_finalized;

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
                    <Badge variant={isCancelled ? 'danger' : isFinalized ? 'success' : 'neutral'}>
                      {isCancelled
                        ? 'Dibatalkan'
                        : isFinalized
                        ? 'Absensi Final'
                        : 'Belum dicek'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-semibold text-[#1e1e1e] line-clamp-2">
                    {evt.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#1e1e1e]/60">
                    <CalendarDaysIcon className="w-4 h-4 shrink-0" />
                    <span>{formatDate(evt.event_date)}</span>
                  </div>
                </div>

                {/* Aksi Event */}
                <div className="pt-3 border-t border-[#1e1e1e]/10 flex items-center justify-between gap-2">
                  {canRecordAttendance && !isCancelled && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onOpenAttendance(evt)}
                      className="flex items-center gap-1.5"
                    >
                      <CheckBadgeIcon className="w-4 h-4 text-[#4285f4]" />
                      <span>{isFinalized ? 'Koreksi Absensi' : 'Catat Absensi'}</span>
                    </Button>
                  )}

                  {canManageEvents && !isCancelled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancelEvent(evt.id)}
                      className="text-[#ea4335] hover:bg-[#f8d8d8] ml-auto flex items-center gap-1"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>Batalkan</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

