import React from 'react';
import type { TrackerGroup, TrackerTask, TaskStatus, TaskStage } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatters';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TrackerGroupCardSectionProps {
  group: TrackerGroup;
  tasks: TrackerTask[];
  hasBudgetColumns: boolean;
  hasLinkColumn: boolean;
  canEdit: boolean;
  onUpdateTask: <K extends keyof TrackerTask>(
    taskId: string,
    field: K,
    value: TrackerTask[K]
  ) => void;
  onAddTask: (groupId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteGroup: (groupId: string) => void;
}

export const TrackerGroupCardSection: React.FC<TrackerGroupCardSectionProps> = ({
  group,
  tasks,
  hasBudgetColumns,
  hasLinkColumn,
  canEdit,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
  onDeleteGroup,
}) => {
  return (
    <div className="flex flex-col border border-[#1e1e1e]/10 rounded-2xl bg-white overflow-hidden shadow-none">
      {/* Header Kelompok Tugas */}
      <div className="p-4 bg-[#f0f0f0]/40 border-b border-[#1e1e1e]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[#1e1e1e]">{group.name}</h3>
          <span className="text-xs text-[#1e1e1e]/50">({tasks.length} tugas)</span>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddTask(group.id)}
              className="flex items-center gap-1 text-xs"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Tambah Tugas</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDeleteGroup(group.id)}
              className="h-8 w-8 text-[#ea4335] hover:bg-[#f8d8d8]"
              title="Hapus kelompok tugas"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Tabel Tugas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1e1e1e]/10 bg-white text-[#1e1e1e]/60 font-medium">
              <th className="py-2.5 px-3 min-w-[160px]">Tugas</th>
              <th className="py-2.5 px-3 min-w-[140px]">Detail</th>
              <th className="py-2.5 px-3 min-w-[110px]">Status</th>
              <th className="py-2.5 px-3 min-w-[90px]">Stage</th>
              <th className="py-2.5 px-3 min-w-[100px]">PIC</th>
              <th className="py-2.5 px-3 min-w-[100px]">Deadline</th>
              {hasLinkColumn && <th className="py-2.5 px-3 min-w-[130px]">Tautan Media</th>}
              {hasBudgetColumns && (
                <>
                  <th className="py-2.5 px-3 min-w-[60px]">Qty</th>
                  <th className="py-2.5 px-3 min-w-[90px]">Harga Satuan</th>
                  <th className="py-2.5 px-3 min-w-[90px]">Total</th>
                  <th className="py-2.5 px-3 min-w-[90px]">Pembeli</th>
                  <th className="py-2.5 px-3 min-w-[100px]">Nota</th>
                </>
              )}
              <th className="py-2.5 px-3 min-w-[120px]">Catatan</th>
              {canEdit && <th className="py-2.5 px-3 text-right w-12">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e1e]/10">
            {tasks.length === 0 ? (
              <tr>
                <td
                  colSpan={hasBudgetColumns ? 12 : hasLinkColumn ? 8 : 7}
                  className="py-6 text-center text-[#1e1e1e]/40"
                >
                  Belum ada tugas di kelompok ini.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const totalBudget = (task.quantity || 0) * (task.unit_price || 0);

                return (
                  <tr key={task.id} className="hover:bg-[#f0f0f0]/30 transition-colors">
                    {/* Tugas Title */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={task.title}
                        disabled={!canEdit}
                        onChange={(e) => onUpdateTask(task.id, 'title', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none font-medium text-[#1e1e1e]"
                      />
                    </td>

                    {/* Detail */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={task.details}
                        disabled={!canEdit}
                        placeholder="Detail tugas..."
                        onChange={(e) => onUpdateTask(task.id, 'details', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none text-[#1e1e1e]/70"
                      />
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3">
                      <select
                        value={task.status}
                        disabled={!canEdit}
                        onChange={(e) =>
                          onUpdateTask(task.id, 'status', e.target.value as TaskStatus)
                        }
                        className={`px-2 py-1 rounded text-[11px] font-medium outline-none border-none ${
                          task.status === 'done'
                            ? 'bg-[#ccf6c5] text-[#34a853]'
                            : task.status === 'in_progress'
                            ? 'bg-[#c3ecf6] text-[#4285f4]'
                            : task.status === 'cancelled'
                            ? 'bg-[#f8d8d8] text-[#ea4335]'
                            : 'bg-[#f0f0f0] text-[#1e1e1e]/70'
                        }`}
                      >
                        <option value="not_started">Belum mulai</option>
                        <option value="in_progress">Dikerjakan</option>
                        <option value="done">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </td>

                    {/* Stage */}
                    <td className="py-2 px-3">
                      <select
                        value={task.stage}
                        disabled={!canEdit}
                        onChange={(e) =>
                          onUpdateTask(task.id, 'stage', e.target.value as TaskStage)
                        }
                        className="px-2 py-1 rounded bg-[#f0f0f0]/60 text-[11px] outline-none"
                      >
                        <option value="pre_event">Pre-Event</option>
                        <option value="on_event">On Event</option>
                        <option value="post_event">Post-Event</option>
                      </select>
                    </td>

                    {/* PIC (Bebas Ketik) */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={task.pic}
                        disabled={!canEdit}
                        placeholder="Nama PIC"
                        onChange={(e) => onUpdateTask(task.id, 'pic', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none text-[#1e1e1e]"
                      />
                    </td>

                    {/* Deadline */}
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={task.deadline}
                        disabled={!canEdit}
                        onChange={(e) => onUpdateTask(task.id, 'deadline', e.target.value)}
                        className="bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none text-[#1e1e1e]/70"
                      />
                    </td>

                    {/* Kolom Tautan (Publication) */}
                    {hasLinkColumn && (
                      <td className="py-2 px-3">
                        <input
                          type="url"
                          value={task.link || ''}
                          disabled={!canEdit}
                          placeholder="https://..."
                          onChange={(e) => onUpdateTask(task.id, 'link', e.target.value)}
                          className="w-full bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none text-[#4285f4]"
                        />
                      </td>
                    )}

                    {/* Kolom Anggaran (E&C) */}
                    {hasBudgetColumns && (
                      <>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            value={task.quantity || 1}
                            disabled={!canEdit}
                            onChange={(e) =>
                              onUpdateTask(task.id, 'quantity', parseInt(e.target.value, 10) || 1)
                            }
                            className="w-12 bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none text-center"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={task.unit_price || 0}
                            disabled={!canEdit}
                            onChange={(e) =>
                              onUpdateTask(task.id, 'unit_price', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-20 bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none"
                          />
                        </td>
                        <td className="py-2 px-3 font-semibold text-[#1e1e1e]">
                          {formatCurrency(totalBudget)}
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={task.buyer_name || ''}
                            disabled={!canEdit}
                            placeholder="Pembeli"
                            onChange={(e) => onUpdateTask(task.id, 'buyer_name', e.target.value)}
                            className="w-20 bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={task.receipt || ''}
                            disabled={!canEdit}
                            placeholder="Keterangan nota"
                            onChange={(e) => onUpdateTask(task.id, 'receipt', e.target.value)}
                            className="w-24 bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none"
                          />
                        </td>
                      </>
                    )}

                    {/* Catatan */}
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={task.notes}
                        disabled={!canEdit}
                        placeholder="Catatan..."
                        onChange={(e) => onUpdateTask(task.id, 'notes', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-[#4285f4] outline-none text-[#1e1e1e]/60"
                      />
                    </td>

                    {/* Aksi Hapus */}
                    {canEdit && (
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="text-[#ea4335] hover:text-[#d93025] p-1 rounded"
                          title="Hapus tugas"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

