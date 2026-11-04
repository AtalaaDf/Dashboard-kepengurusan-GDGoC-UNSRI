import React, { useState } from 'react';
import type { Division } from '@/types';
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
import { memberSchema } from '../data/member.schema';

interface MemberFormModalSectionProps {
  isOpen: boolean;
  onClose: () => void;
  divisions: Division[];
  onAddMember: (fullName: string, divisionId: string) => Promise<boolean>;
}

export const MemberFormModalSection: React.FC<MemberFormModalSectionProps> = ({
  isOpen,
  onClose,
  divisions,
  onAddMember,
}) => {
  const [fullName, setFullName] = useState('');
  const [divisionId, setDivisionId] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [divisionError, setDivisionError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFullName('');
    setDivisionId('');
    setNameError(undefined);
    setDivisionError(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(undefined);
    setDivisionError(undefined);

    const result = memberSchema.safeParse({
      full_name: fullName,
      division_id: divisionId,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.full_name?.[0]) setNameError(fieldErrors.full_name[0]);
      if (fieldErrors.division_id?.[0]) setDivisionError(fieldErrors.division_id[0]);
      return;
    }

    setIsSubmitting(true);
    const success = await onAddMember(fullName, divisionId);
    setIsSubmitting(false);

    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Member Baru</DialogTitle>
          <DialogDescription>
            Masukkan nama lengkap dan tentukan divisi untuk member batch aktif.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="member-fullname">Nama Lengkap</Label>
            <Input
              id="member-fullname"
              placeholder="Contoh: Muhammad Ihsan"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (nameError) setNameError(undefined);
              }}
              isError={Boolean(nameError)}
              disabled={isSubmitting}
            />
            {nameError && (
              <p className="text-xs text-[#ea4335]">{nameError}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="member-division">Divisi</Label>
            <select
              id="member-division"
              value={divisionId}
              onChange={(e) => {
                setDivisionId(e.target.value);
                if (divisionError) setDivisionError(undefined);
              }}
              className="min-h-[40px] px-3 py-2 rounded-lg border border-[#1e1e1e]/20 bg-white text-sm text-[#1e1e1e] outline-none focus:ring-2 focus:ring-[#4285f4]/30"
              disabled={isSubmitting}
            >
              <option value="">-- Pilih Divisi --</option>
              {divisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name} ({div.type === 'technical' ? 'Technical' : 'Non-Technical'})
                </option>
              ))}
            </select>
            {divisionError && (
              <p className="text-xs text-[#ea4335]">{divisionError}</p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-[#1e1e1e]/10">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Member'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

