import React, { useState } from 'react';
import type { Division, Member } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { divisionSchema } from '../data/member.schema';
import { TrashIcon } from '@heroicons/react/24/outline';

interface DivisionModalSectionProps {
  isOpen: boolean;
  onClose: () => void;
  divisions: Division[];
  members: Member[];
  onAddDivision: (name: string, type: 'technical' | 'non_technical') => Promise<boolean>;
  onDeleteDivision: (divisionId: string) => Promise<boolean>;
  errorMessage: string | null;
  clearErrorMessage: () => void;
}

export const DivisionModalSection: React.FC<DivisionModalSectionProps> = ({
  isOpen,
  onClose,
  divisions,
  members,
  onAddDivision,
  onDeleteDivision,
  errorMessage,
  clearErrorMessage,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'technical' | 'non_technical'>('technical');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setType('technical');
    setNameError(undefined);
    clearErrorMessage();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(undefined);
    clearErrorMessage();

    const result = divisionSchema.safeParse({ name, type });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.name?.[0]) setNameError(fieldErrors.name[0]);
      return;
    }

    setIsSubmitting(true);
    const success = await onAddDivision(name, type);
    setIsSubmitting(false);

    if (success) {
      setName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Kelola Divisi Organisasi</DialogTitle>
          <DialogDescription>
            Buat divisi baru dan tinjau divisi yang aktif. Divisi yang masih memiliki member tidak dapat dihapus.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-[#f8d8d8] text-[#ea4335] text-xs font-medium border border-[#ea4335]/20">
            {errorMessage}
          </div>
        )}

        {/* Formulir Tambah Divisi */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 rounded-xl border border-[#1e1e1e]/10 bg-[#f0f0f0]/30">
          <span className="text-xs font-semibold text-[#1e1e1e]">Tambah Divisi Baru</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="division-name">Nama Divisi</Label>
              <Input
                id="division-name"
                placeholder="Contoh: Mobile Development"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(undefined);
                }}
                isError={Boolean(nameError)}
                disabled={isSubmitting}
              />
              {nameError && (
                <p className="text-xs text-[#ea4335]">{nameError}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="division-type">Kategori</Label>
              <select
                id="division-type"
                value={type}
                onChange={(e) => setType(e.target.value as 'technical' | 'non_technical')}
                className="min-h-[40px] px-3 py-2 rounded-lg border border-[#1e1e1e]/20 bg-white text-sm text-[#1e1e1e] outline-none focus:ring-2 focus:ring-[#4285f4]/30"
                disabled={isSubmitting}
              >
                <option value="technical">Technical</option>
                <option value="non_technical">Non-Technical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-1">
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menambahkan...' : 'Tambah Divisi'}
            </Button>
          </div>
        </form>

        {/* Daftar Divisi yang Ada */}
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-xs font-semibold text-[#1e1e1e]">Daftar Divisi Terdaftar</span>
          <div className="max-h-56 overflow-y-auto divide-y divide-[#1e1e1e]/10 border border-[#1e1e1e]/10 rounded-xl bg-white">
            {divisions.map((div) => {
              const memberCount = members.filter((m) => m.division_id === div.id).length;
              const hasMembers = memberCount > 0;

              return (
                <div
                  key={div.id}
                  className="flex items-center justify-between p-3 hover:bg-[#f0f0f0]/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-medium text-[#1e1e1e]">{div.name}</span>
                    <Badge variant={div.type === 'technical' ? 'info' : 'neutral'}>
                      {div.type === 'technical' ? 'Technical' : 'Non-Technical'}
                    </Badge>
                    <span className="text-xs text-[#1e1e1e]/50">({memberCount} member)</span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteDivision(div.id)}
                    disabled={hasMembers}
                    title={hasMembers ? 'Divisi memiliki member terdaftar' : 'Hapus divisi'}
                    className={hasMembers ? 'opacity-30 cursor-not-allowed' : 'text-[#ea4335] hover:bg-[#f8d8d8]'}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

