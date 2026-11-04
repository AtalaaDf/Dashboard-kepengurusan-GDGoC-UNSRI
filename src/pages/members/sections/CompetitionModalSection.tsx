import React, { useState } from 'react';
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
import { competitionSchema } from '../data/competition.schema';

interface CompetitionModalSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCompetition: (name: string, organizer: string) => Promise<boolean>;
}

export const CompetitionModalSection: React.FC<CompetitionModalSectionProps> = ({
  isOpen,
  onClose,
  onAddCompetition,
}) => {
  const [competitionName, setCompetitionName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [organizerError, setOrganizerError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCompetitionName('');
    setOrganizer('');
    setNameError(undefined);
    setOrganizerError(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(undefined);
    setOrganizerError(undefined);

    const result = competitionSchema.safeParse({
      competition_name: competitionName,
      organizer,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.competition_name?.[0]) {
        setNameError(fieldErrors.competition_name[0]);
      }
      if (fieldErrors.organizer?.[0]) {
        setOrganizerError(fieldErrors.organizer[0]);
      }
      return;
    }

    setIsSubmitting(true);
    const success = await onAddCompetition(competitionName, organizer);
    setIsSubmitting(false);

    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Catat Keikutsertaan Lomba</DialogTitle>
          <DialogDescription>
            Masukkan nama lomba dan institusi atau pihak penyelenggara kegiatan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="competition-name">Nama Lomba</Label>
            <Input
              id="competition-name"
              placeholder="Contoh: Hackathon Nasional Gemastik 2026"
              value={competitionName}
              onChange={(e) => {
                setCompetitionName(e.target.value);
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
            <Label htmlFor="competition-organizer">Asal Penyelenggara</Label>
            <Input
              id="competition-organizer"
              placeholder="Contoh: Puspresnas / Universitas ABC"
              value={organizer}
              onChange={(e) => {
                setOrganizer(e.target.value);
                if (organizerError) setOrganizerError(undefined);
              }}
              isError={Boolean(organizerError)}
              disabled={isSubmitting}
            />
            {organizerError && (
              <p className="text-xs text-[#ea4335]">{organizerError}</p>
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Lomba'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

