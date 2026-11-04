import { useState, useEffect, useMemo } from 'react';
import type { OrganizationEvent, Attendance } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/data/auth/auth-context';

const INITIAL_EVENTS: OrganizationEvent[] = [
  {
    id: 'evt-1',
    batch_id: 'batch-2026',
    name: 'Info Session & Welcoming Party',
    event_date: '2026-09-12',
    type: 'offline',
    status: 'active',
    attendance_finalized: true,
  },
  {
    id: 'evt-2',
    batch_id: 'batch-2026',
    name: 'Workshop Git & GitHub',
    event_date: '2026-09-26',
    type: 'online',
    status: 'active',
    attendance_finalized: true,
  },
  {
    id: 'evt-3',
    batch_id: 'batch-2026',
    name: 'Study Jam 1: Web Development Basics',
    event_date: '2026-10-10',
    type: 'online',
    status: 'active',
    attendance_finalized: true,
  },
  {
    id: 'evt-4',
    batch_id: 'batch-2026',
    name: 'Tech Talk: Cloud Architecture',
    event_date: '2026-10-24',
    type: 'offline',
    status: 'active',
    attendance_finalized: false,
  },
  {
    id: 'evt-5',
    batch_id: 'batch-2026',
    name: 'Study Jam 2: React State Management',
    event_date: '2026-11-07',
    type: 'online',
    status: 'active',
    attendance_finalized: false,
  },
];

const INITIAL_ATTENDANCES: Attendance[] = [
  { id: 'att-1', event_id: 'evt-1', member_id: 'mem-1', recorded_by_role: 'admin' },
  { id: 'att-2', event_id: 'evt-1', member_id: 'mem-2', recorded_by_role: 'admin' },
  { id: 'att-3', event_id: 'evt-1', member_id: 'mem-3', recorded_by_role: 'admin' },
  { id: 'att-4', event_id: 'evt-1', member_id: 'mem-4', recorded_by_role: 'admin' },

  { id: 'att-5', event_id: 'evt-2', member_id: 'mem-1', recorded_by_role: 'admin' },
  { id: 'att-6', event_id: 'evt-2', member_id: 'mem-2', recorded_by_role: 'admin' },
  { id: 'att-7', event_id: 'evt-2', member_id: 'mem-4', recorded_by_role: 'admin' },

  { id: 'att-8', event_id: 'evt-3', member_id: 'mem-2', recorded_by_role: 'admin' },
  { id: 'att-9', event_id: 'evt-3', member_id: 'mem-3', recorded_by_role: 'admin' },
  { id: 'att-10', event_id: 'evt-3', member_id: 'mem-4', recorded_by_role: 'admin' },
];

const STORAGE_KEY_EVENTS = 'gdgoc_events_data';
const STORAGE_KEY_ATTENDANCES = 'gdgoc_attendances_data';

export function useEvents() {
  const { role } = useAuth();

  const [events, setEvents] = useState<OrganizationEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ATTENDANCES);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simpan ke localStorage saat berubah
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ATTENDANCES, JSON.stringify(attendances));
  }, [attendances]);

  // Coba ambil dari Supabase jika ada koneksi
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: eventData } = await supabase.from('events').select('*');
        if (eventData && eventData.length > 0) {
          setEvents(eventData as OrganizationEvent[]);
        }

        const { data: attData } = await supabase.from('attendances').select('*');
        if (attData && attData.length > 0) {
          setAttendances(attData as Attendance[]);
        }
      } catch {
        // Fallback local
      }
    }
    loadFromSupabase();
  }, []);

  const canManageEvents = role === 'superadmin' || role === 'po';
  const canRecordAttendance = role === 'superadmin' || role === 'admin';

  // Tambah Event
  const addEvent = async (name: string, eventDate: string, type: 'online' | 'offline'): Promise<boolean> => {
    if (!canManageEvents) {
      setErrorMessage('Hanya Superadmin dan PO yang dapat membuat event.');
      return false;
    }

    const newEvent: OrganizationEvent = {
      id: `evt-${Date.now()}`,
      batch_id: 'batch-2026',
      name: name.trim(),
      event_date: eventDate,
      type,
      status: 'active',
      attendance_finalized: false,
    };

    try {
      await supabase.from('events').insert([newEvent]);
    } catch {
      // Offline fallback
    }

    setEvents((prev) => [newEvent, ...prev]);
    setErrorMessage(null);
    return true;
  };

  // Batalkan Event (event yang sudah punya absensi dibatalkan, bukan dihapus sembarangan sesuai agent.md Bab 10 point 2)
  const cancelEvent = async (eventId: string): Promise<boolean> => {
    if (!canManageEvents) {
      setErrorMessage('Hanya Superadmin dan PO yang dapat membatalkan event.');
      return false;
    }

    try {
      await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', eventId);
    } catch {
      // Offline fallback
    }

    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: 'cancelled' } : e))
    );
    setErrorMessage(null);
    return true;
  };

  // Simpan Absensi Kehadiran
  const saveAttendance = async (
    eventId: string,
    presentMemberIds: string[],
    markAsFinal: boolean
  ): Promise<boolean> => {
    if (!canRecordAttendance) {
      setErrorMessage('Hanya Superadmin dan Admin yang dapat mencatat absensi.');
      return false;
    }

    // Buat daftar kehadiran baru untuk event ini
    const newEventAttendances: Attendance[] = presentMemberIds.map((mId) => ({
      id: `att-${eventId}-${mId}`,
      event_id: eventId,
      member_id: mId,
      recorded_by_role: role || 'admin',
    }));

    // Perbarui state attendances: hapus yang lama untuk event ini, masukkan yang baru
    setAttendances((prev) => {
      const filtered = prev.filter((a) => a.event_id !== eventId);
      return [...filtered, ...newEventAttendances];
    });

    // Perbarui status finalized event
    if (markAsFinal) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, attendance_finalized: true } : e
        )
      );
    }

    try {
      // Sinkronkan ke Supabase jika aktif
      await supabase.from('attendances').delete().eq('event_id', eventId);
      if (newEventAttendances.length > 0) {
        await supabase.from('attendances').insert(newEventAttendances);
      }
      if (markAsFinal) {
        await supabase
          .from('events')
          .update({ attendance_finalized: true })
          .eq('id', eventId);
      }
    } catch {
      // Offline fallback
    }

    setErrorMessage(null);
    return true;
  };

  // Mengambil daftar member yang hadir di suatu event
  const getEventPresentMemberIds = (eventId: string): string[] => {
    return attendances
      .filter((a) => a.event_id === eventId)
      .map((a) => a.member_id);
  };

  // Filter Event
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchQuery = evt.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());
      const matchType =
        selectedTypeFilter === 'all' || evt.type === selectedTypeFilter;
      const matchStatus =
        selectedStatusFilter === 'all' || evt.status === selectedStatusFilter;

      return matchQuery && matchType && matchStatus;
    });
  }, [events, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  return {
    events: filteredEvents,
    totalEventsCount: events.length,
    finalizedEventsCount: events.filter((e) => e.attendance_finalized && e.status === 'active').length,
    searchQuery,
    setSearchQuery,
    selectedTypeFilter,
    setSelectedTypeFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    errorMessage,
    setErrorMessage,
    canManageEvents,
    canRecordAttendance,
    addEvent,
    cancelEvent,
    saveAttendance,
    getEventPresentMemberIds,
  };
}

