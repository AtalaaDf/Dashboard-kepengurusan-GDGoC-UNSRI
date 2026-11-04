import React, { useState } from 'react';
import { useEventTracker } from './data/use-event-tracker';
import { TrackerHeaderSection } from './sections/TrackerHeaderSection';
import { TrackerGroupCardSection } from './sections/TrackerGroupCardSection';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlusIcon } from '@heroicons/react/24/outline';
import { ANIMATIONS } from '@/lib/animations';

export const EventTrackerPage: React.FC = () => {
  const {
    event,
    divisions,
    currentDivision,
    activeDivisionId,
    setActiveDivisionId,
    groups,
    stageFilter,
    setStageFilter,
    completionPercentage,
    isSaved,
    canEditTracker,
    getTasksByGroupId,
    updateTaskField,
    addTask,
    deleteTask,
    addGroup,
    deleteGroup,
    saveTracker,
    handleExit,
  } = useEventTracker();

  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  if (!event) {
    return (
      <div className={`p-12 text-center text-[#1e1e1e]/60 text-sm ${ANIMATIONS.PAGE_FADE_IN}`}>
        Event tidak ditemukan.{' '}
        <button
          type="button"
          onClick={handleExit}
          className="text-[#4285f4] underline"
        >
          Kembali ke daftar event
        </button>
      </div>
    );
  }

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      addGroup(newGroupName);
      setNewGroupName('');
      setIsAddingGroup(false);
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${ANIMATIONS.PAGE_FADE_IN}`}>
      {/* Header Tracker */}
      <TrackerHeaderSection
        event={event}
        completionPercentage={completionPercentage}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        isSaved={isSaved}
        canEdit={canEditTracker}
        onSave={saveTracker}
        onExit={handleExit}
      />

      {/* Tab Navigasi Divisi Tracker */}
      <div className="flex items-center justify-between border-b border-[#1e1e1e]/10 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto">
          {divisions.map((div) => (
            <button
              key={div.id}
              type="button"
              onClick={() => setActiveDivisionId(div.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                activeDivisionId === div.id
                  ? 'border-[#4285f4] text-[#4285f4] bg-[#c3ecf6]/20'
                  : 'border-transparent text-[#1e1e1e]/60 hover:text-[#1e1e1e] hover:bg-[#f0f0f0]'
              }`}
            >
              {div.name}
            </button>
          ))}
        </div>

        {canEditTracker && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAddingGroup(true)}
            className="flex items-center gap-1 text-xs shrink-0"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Tambah Kelompok</span>
          </Button>
        )}
      </div>

      {/* Form Tambah Kelompok Baru */}
      {isAddingGroup && (
        <form
          onSubmit={handleCreateGroup}
          className="p-4 rounded-xl border border-[#4285f4]/30 bg-[#c3ecf6]/20 flex items-center gap-3 max-w-md"
        >
          <Input
            placeholder="Nama kelompok baru (misal: Konsumsi, IT)"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="h-9 text-xs"
            autoFocus
          />
          <Button type="submit" variant="default" size="sm">
            Tambah
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingGroup(false)}
          >
            Batal
          </Button>
        </form>
      )}

      {/* Daftar Kartu Kelompok Tugas */}
      <div className="flex flex-col gap-6">
        {groups.length === 0 ? (
          <div className="p-8 text-center border border-[#1e1e1e]/10 rounded-2xl bg-white text-xs text-[#1e1e1e]/50">
            Belum ada kelompok tugas di divisi {currentDivision?.name}. Klik &quot;Tambah Kelompok&quot; di atas untuk memulai.
          </div>
        ) : (
          groups.map((group) => (
            <TrackerGroupCardSection
              key={group.id}
              group={group}
              tasks={getTasksByGroupId(group.id)}
              hasBudgetColumns={Boolean(currentDivision?.has_budget_columns)}
              hasLinkColumn={Boolean(currentDivision?.has_link_column)}
              canEdit={canEditTracker}
              onUpdateTask={updateTaskField}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onDeleteGroup={deleteGroup}
            />
          ))
        )}
      </div>
    </div>
  );
};

