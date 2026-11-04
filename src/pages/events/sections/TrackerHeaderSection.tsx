import React from 'react';
import type { OrganizationEvent, TaskStage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

interface TrackerHeaderSectionProps {
  event: OrganizationEvent;
  completionPercentage: number;
  stageFilter: 'all' | TaskStage;
  onStageFilterChange: (stage: 'all' | TaskStage) => void;
  isSaved: boolean;
  canEdit: boolean;
  onSave: () => void;
  onExit: () => void;
}

export const TrackerHeaderSection: React.FC<TrackerHeaderSectionProps> = ({
  event,
  completionPercentage,
  stageFilter,
  onStageFilterChange,
  isSaved,
  canEdit,
  onSave,
  onExit,
}) => {
  return (
    <div className="flex flex-col gap-4 pb-4 border-b border-[#1e1e1e]/10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExit}
            className="flex items-center gap-1.5"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Keluar</span>
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#1e1e1e]">
                {event.name}
              </h1>
              <Badge variant={event.type === 'online' ? 'info' : 'warning'}>
                {event.type === 'online' ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <p className="text-xs text-[#1e1e1e]/60 mt-0.5">
              Tracker Kerja Kepanitiaan Event &bull; Progres Keseluruhan:{' '}
              <strong className="text-[#34a853]">{completionPercentage}% Selesai</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {isSaved && (
            <span className="text-xs text-[#34a853] font-medium flex items-center gap-1">
              <CheckIcon className="w-3.5 h-3.5" />
              Tersimpan
            </span>
          )}

          {canEdit && (
            <Button
              type="button"
              variant="default"
              onClick={onSave}
              className="flex items-center gap-1.5"
            >
              <span>Simpan Perubahan</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Stage */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-[#1e1e1e]/60">
          <span>Filter Tahap (Stage):</span>
          {(['all', 'pre_event', 'on_event', 'post_event'] as const).map((stg) => (
            <button
              key={stg}
              type="button"
              onClick={() => onStageFilterChange(stg)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                stageFilter === stg
                  ? 'bg-[#4285f4] text-white'
                  : 'bg-[#f0f0f0] text-[#1e1e1e]/70 hover:bg-[#e4e4e4]'
              }`}
            >
              {stg === 'all'
                ? 'Semua'
                : stg === 'pre_event'
                ? 'Pre-Event'
                : stg === 'on_event'
                ? 'On Event'
                : 'Post-Event'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-32 bg-[#f0f0f0] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#34a853] h-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-[#1e1e1e]">
            {completionPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

