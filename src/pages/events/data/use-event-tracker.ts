import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type {
  OrganizationEvent,
  TrackerDivision,
  TrackerGroup,
  TrackerTask,
  TaskStage,
} from '@/types';
import { instantiateTrackerFromTemplate } from './tracker-templates';
import { useAuth } from '@/data/auth/auth-context';

const STORAGE_KEY_TDIVISIONS = 'gdgoc_tracker_divisions';
const STORAGE_KEY_TGROUPS = 'gdgoc_tracker_groups';
const STORAGE_KEY_TTASKS = 'gdgoc_tracker_tasks';

export function useEventTracker() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const canEditTracker = role === 'superadmin' || role === 'po';

  const [events] = useState<OrganizationEvent[]>(() => {
    const raw = localStorage.getItem('gdgoc_events_data');
    return raw ? JSON.parse(raw) : [];
  });

  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === eventId);
  }, [events, eventId]);

  const [divisions, setDivisions] = useState<TrackerDivision[]>([]);
  const [groups, setGroups] = useState<TrackerGroup[]>([]);
  const [tasks, setTasks] = useState<TrackerTask[]>([]);
  const [activeDivisionId, setActiveDivisionId] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<'all' | TaskStage>('all');
  const [isSaved, setIsSaved] = useState(false);

  // Inisialisasi atau load data tracker untuk event ini
  useEffect(() => {
    if (!currentEvent || !eventId) return;

    const rawDivs = localStorage.getItem(STORAGE_KEY_TDIVISIONS);
    const allDivs: TrackerDivision[] = rawDivs ? JSON.parse(rawDivs) : [];
    const eventDivs = allDivs.filter((d) => d.event_id === eventId);

    const rawGrps = localStorage.getItem(STORAGE_KEY_TGROUPS);
    const allGrps: TrackerGroup[] = rawGrps ? JSON.parse(rawGrps) : [];

    const rawTasks = localStorage.getItem(STORAGE_KEY_TTASKS);
    const allTasks: TrackerTask[] = rawTasks ? JSON.parse(rawTasks) : [];

    if (eventDivs.length === 0) {
      // Inisialisasi dari template bawaan
      const instantiated = instantiateTrackerFromTemplate(eventId, currentEvent.type);

      const updatedDivs = [...allDivs, ...instantiated.divisions];
      const updatedGrps = [...allGrps, ...instantiated.groups];
      const updatedTasks = [...allTasks, ...instantiated.tasks];

      localStorage.setItem(STORAGE_KEY_TDIVISIONS, JSON.stringify(updatedDivs));
      localStorage.setItem(STORAGE_KEY_TGROUPS, JSON.stringify(updatedGrps));
      localStorage.setItem(STORAGE_KEY_TTASKS, JSON.stringify(updatedTasks));

      setDivisions(instantiated.divisions);
      setGroups(instantiated.groups);
      setTasks(instantiated.tasks);
      if (instantiated.divisions[0]) {
        setActiveDivisionId(instantiated.divisions[0].id);
      }
    } else {
      setDivisions(eventDivs);
      const divIds = new Set(eventDivs.map((d) => d.id));
      const eventGroups = allGrps.filter((g) => divIds.has(g.tracker_division_id));
      const grpIds = new Set(eventGroups.map((g) => g.id));
      const eventTasks = allTasks.filter((t) => grpIds.has(t.group_id));

      setGroups(eventGroups);
      setTasks(eventTasks);
      if (eventDivs[0]) {
        setActiveDivisionId(eventDivs[0].id);
      }
    }
  }, [currentEvent, eventId]);

  // Divisi aktif saat ini
  const currentDivision = useMemo(() => {
    return divisions.find((d) => d.id === activeDivisionId) || divisions[0];
  }, [divisions, activeDivisionId]);

  // Kelompok tugas untuk divisi aktif
  const groupsInActiveDivision = useMemo(() => {
    if (!currentDivision) return [];
    return groups.filter((g) => g.tracker_division_id === currentDivision.id);
  }, [groups, currentDivision]);

  // Filter tugas per kelompok
  const getTasksByGroupId = (groupId: string): TrackerTask[] => {
    return tasks.filter((t) => {
      const matchGroup = t.group_id === groupId;
      const matchStage = stageFilter === 'all' || t.stage === stageFilter;
      return matchGroup && matchStage;
    });
  };

  // Hitung persentase tugas selesai event ini
  const completionPercentage = useMemo(() => {
    const validTasks = tasks.filter((t) => t.status !== 'cancelled');
    if (validTasks.length === 0) return 0;
    const doneTasks = validTasks.filter((t) => t.status === 'done');
    return Math.round((doneTasks.length / validTasks.length) * 100);
  }, [tasks]);

  // Update nilai field tugas
  const updateTaskField = <K extends keyof TrackerTask>(
    taskId: string,
    field: K,
    value: TrackerTask[K]
  ) => {
    if (!canEditTracker) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t))
    );
    setIsSaved(false);
  };

  // Tambah tugas baru ke kelompok
  const addTask = (groupId: string) => {
    if (!canEditTracker) return;
    const newTask: TrackerTask = {
      id: `task-${Date.now()}`,
      group_id: groupId,
      title: 'Tugas Baru',
      details: '',
      status: 'not_started',
      pic: '',
      stage: 'pre_event',
      deadline: '',
      notes: '',
      link: '',
      quantity: 1,
      unit_price: 0,
      buyer_name: '',
      receipt: '',
      sort_order: tasks.length + 1,
    };
    setTasks((prev) => [...prev, newTask]);
    setIsSaved(false);
  };

  // Hapus tugas
  const deleteTask = (taskId: string) => {
    if (!canEditTracker) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setIsSaved(false);
  };

  // Tambah kelompok tugas baru di divisi aktif
  const addGroup = (name: string) => {
    if (!canEditTracker || !currentDivision) return;
    const newGroup: TrackerGroup = {
      id: `tgrp-${Date.now()}`,
      tracker_division_id: currentDivision.id,
      name: name.trim() || 'Kelompok Baru',
      sort_order: groups.length + 1,
    };
    setGroups((prev) => [...prev, newGroup]);
    setIsSaved(false);
  };

  // Hapus kelompok tugas
  const deleteGroup = (groupId: string) => {
    if (!canEditTracker) return;
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setTasks((prev) => prev.filter((t) => t.group_id !== groupId));
    setIsSaved(false);
  };

  // Simpan perubahan ke storage
  const saveTracker = () => {
    if (!eventId) return;

    // Ambil data storage untuk event lain
    const rawDivs = localStorage.getItem(STORAGE_KEY_TDIVISIONS);
    const allDivs: TrackerDivision[] = rawDivs ? JSON.parse(rawDivs) : [];
    const otherDivs = allDivs.filter((d) => d.event_id !== eventId);
    localStorage.setItem(
      STORAGE_KEY_TDIVISIONS,
      JSON.stringify([...otherDivs, ...divisions])
    );

    const divIds = new Set(divisions.map((d) => d.id));
    const rawGrps = localStorage.getItem(STORAGE_KEY_TGROUPS);
    const allGrps: TrackerGroup[] = rawGrps ? JSON.parse(rawGrps) : [];
    const otherGrps = allGrps.filter((g) => !divIds.has(g.tracker_division_id));
    localStorage.setItem(
      STORAGE_KEY_TGROUPS,
      JSON.stringify([...otherGrps, ...groups])
    );

    const grpIds = new Set(groups.map((g) => g.id));
    const rawTasks = localStorage.getItem(STORAGE_KEY_TTASKS);
    const allTasks: TrackerTask[] = rawTasks ? JSON.parse(rawTasks) : [];
    const otherTasks = allTasks.filter((t) => !grpIds.has(t.group_id));
    localStorage.setItem(
      STORAGE_KEY_TTASKS,
      JSON.stringify([...otherTasks, ...tasks])
    );

    setIsSaved(true);
  };

  const handleExit = () => {
    navigate('/events');
  };

  return {
    event: currentEvent,
    divisions,
    currentDivision,
    activeDivisionId,
    setActiveDivisionId,
    groups: groupsInActiveDivision,
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
  };
}
