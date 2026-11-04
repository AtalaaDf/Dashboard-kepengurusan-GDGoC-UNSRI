import { useState, useEffect, useMemo } from 'react';
import type { OrganizationEvent, Attendance, TrackerDivision, TrackerGroup, TrackerTask } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/data/auth/auth-context';

const STORAGE_KEY_EVENTS = 'gdgoc_events_data';
const STORAGE_KEY_ATTENDANCES = 'gdgoc_attendances_data';

export function useEvents() {
  const { role } = useAuth();

  const [events, setEvents] = useState<OrganizationEvent[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const { data: eventData, error: eventErr } = await supabase.from('events').select('*');
        if (!eventErr && eventData) {
          setEvents(eventData as OrganizationEvent[]);
          localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(eventData));
        }

        const { data: attData, error: attErr } = await supabase.from('attendances').select('*');
        if (!attErr && attData) {
          setAttendances(attData as Attendance[]);
          localStorage.setItem(STORAGE_KEY_ATTENDANCES, JSON.stringify(attData));
        }
      } catch {
        const savedEvents = localStorage.getItem(STORAGE_KEY_EVENTS);
        if (savedEvents) setEvents(JSON.parse(savedEvents));
        const savedAtts = localStorage.getItem(STORAGE_KEY_ATTENDANCES);
        if (savedAtts) setAttendances(JSON.parse(savedAtts));
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

    let activeBatchId = 'b0000000-0000-0000-0000-000000002026';
    try {
      const { data: batchData } = await supabase.from('batches').select('id').eq('is_active', true).maybeSingle();
      if (batchData?.id) {
        activeBatchId = batchData.id;
      }
    } catch {
      // abaikan
    }

    const eventPayload = {
      batch_id: activeBatchId,
      name: name.trim(),
      event_date: eventDate,
      type,
      status: 'active' as const,
      attendance_finalized: false,
    };

    try {
      const { data, error } = await supabase.from('events').insert([eventPayload]).select().single();
      if (!error && data) {
        setEvents((prev) => [data as OrganizationEvent, ...prev]);
        setErrorMessage(null);
        return true;
      }
    } catch {
      // Offline fallback
    }

    const newEvent: OrganizationEvent = {
      id: `evt-${Date.now()}`,
      ...eventPayload,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setErrorMessage(null);
    return true;
  };

  // Hapus Event Permanen beserta data relasi (absensi & tracker)
  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (!canManageEvents) {
      setErrorMessage('Hanya Superadmin dan PO yang dapat menghapus event.');
      return false;
    }

    try {
      await supabase.from('events').delete().eq('id', eventId);
      await supabase.from('attendances').delete().eq('event_id', eventId);
    } catch {
      // Offline fallback
    }

    // 1. Hapus event dari state
    setEvents((prev) => prev.filter((e) => e.id !== eventId));

    // 2. Hapus data presensi event terkait
    setAttendances((prev) => prev.filter((a) => a.event_id !== eventId));

    // 3. Bersihkan data tracker divisi, grup, dan tugas terkait event ini di localStorage
    try {
      const rawDivs = localStorage.getItem('gdgoc_tracker_divisions');
      const allDivs: TrackerDivision[] = rawDivs ? JSON.parse(rawDivs) : [];
      const eventDivIds = new Set(
        allDivs.filter((d) => d.event_id === eventId).map((d) => d.id)
      );
      const remainingDivs = allDivs.filter((d) => d.event_id !== eventId);
      localStorage.setItem('gdgoc_tracker_divisions', JSON.stringify(remainingDivs));

      const rawGrps = localStorage.getItem('gdgoc_tracker_groups');
      const allGrps: TrackerGroup[] = rawGrps ? JSON.parse(rawGrps) : [];
      const eventGrpIds = new Set(
        allGrps.filter((g) => eventDivIds.has(g.tracker_division_id)).map((g) => g.id)
      );
      const remainingGrps = allGrps.filter((g) => !eventDivIds.has(g.tracker_division_id));
      localStorage.setItem('gdgoc_tracker_groups', JSON.stringify(remainingGrps));

      const rawTasks = localStorage.getItem('gdgoc_tracker_tasks');
      const allTasks: TrackerTask[] = rawTasks ? JSON.parse(rawTasks) : [];
      const remainingTasks = allTasks.filter((t) => !eventGrpIds.has(t.group_id));
      localStorage.setItem('gdgoc_tracker_tasks', JSON.stringify(remainingTasks));
    } catch {
      // abaikan kesalahan storage
    }

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
        selectedStatusFilter === 'all' ||
        (selectedStatusFilter === 'finalized' && evt.attendance_finalized) ||
        (selectedStatusFilter === 'unfinalized' && !evt.attendance_finalized);

      return matchQuery && matchType && matchStatus;
    });
  }, [events, searchQuery, selectedTypeFilter, selectedStatusFilter]);

  return {
    events: filteredEvents,
    totalEventsCount: events.length,
    finalizedEventsCount: events.filter((e) => e.attendance_finalized).length,
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
    deleteEvent,
    saveAttendance,
    getEventPresentMemberIds,
  };
}

