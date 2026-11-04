import React from 'react';
import { Button } from '@/components/ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

interface EventHeaderSectionProps {
  canManageEvents: boolean;
  onOpenAddEvent: () => void;
  totalEventsCount: number;
  finalizedEventsCount: number;
}

export const EventHeaderSection: React.FC<EventHeaderSectionProps> = ({
  canManageEvents,
  onOpenAddEvent,
  totalEventsCount,
  finalizedEventsCount,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#1e1e1e]/10">
      <div>
        <h1 className="text-2xl font-semibold text-[#1e1e1e]">Event & Absensi</h1>
        <p className="text-sm text-[#1e1e1e]/60 mt-1">
          Kelola agenda kegiatan dan pencatatan presensi kehadiran ({finalizedEventsCount} final dari {totalEventsCount} total event)
        </p>
      </div>

      {canManageEvents && (
        <Button
          type="button"
          variant="default"
          onClick={onOpenAddEvent}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Event</span>
        </Button>
      )}
    </div>
  );
};

