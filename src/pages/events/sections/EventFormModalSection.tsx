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
import { eventSchema } from '../data/event.schema';

interface EventFormModalSectionProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (name: string, eventDate: string, type: 'online' | 'offline') => Promise<boolean>;
}

export const EventFormModalSection: React.FC<EventFormModalSectionProps> = ({
  isOpen,
  onClose,
  onAddEvent,
}) => {
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [type, setType] = useState<'online' | 'offline'>('online');
  const [nameError, setNameError] = useState<string | undefined>();
  const [dateError, setDateError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setEventDate('');
    setType('online');
    setNameError(undefined);
    setDateError(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(undefined);
    setDateError(undefined);

    const result = eventSchema.safeParse({
      name,
      event_date: eventDate,
      type,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.name?.[0]) setNameError(fieldErrors.name[0]);
      if (fieldErrors.event_date?.[0]) setDateError(fieldErrors.event_date[0]);
      return;
    }

    setIsSubmitting(true);
    const success = await onAddEvent(name, eventDate, type);
    setIsSubmitting(false);

    if (success) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Event Baru</DialogTitle>
          <DialogDescription>
            Tentukan nama, tanggal, dan format kegiatan batch aktif.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-name">Nama Event</Label>
            <Input
              id="event-name"
              placeholder="Contoh: Info Session & Welcoming Party"
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-date">Tanggal Pelaksanaan</Label>
            <Input
              id="event-date"
              type="date"
              value={eventDate}
              onChange={(e) => {
                setEventDate(e.target.value);
                if (dateError) setDateError(undefined);
              }}
              isError={Boolean(dateError)}
              disabled={isSubmitting}
            />
            {dateError && (
              <p className="text-xs text-[#ea4335]">{dateError}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-type">Format Pelaksanaan</Label>
            <select
              id="event-type"
              value={type}
              onChange={(e) => setType(e.target.value as 'online' | 'offline')}
              className="min-h-[40px] px-3 py-2 rounded-lg border border-[#1e1e1e]/20 bg-white text-sm text-[#1e1e1e] outline-none focus:ring-2 focus:ring-[#4285f4]/30"
              disabled={isSubmitting}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
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
              {isSubmitting ? 'Membuat...' : 'Buat Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

