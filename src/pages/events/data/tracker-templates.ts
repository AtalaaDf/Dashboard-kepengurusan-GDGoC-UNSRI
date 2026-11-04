import type { EventType, TrackerDivision, TrackerGroup, TrackerTask } from '@/types';

export interface TemplateStructure {
  divisions: Array<{
    name: string;
    has_budget_columns?: boolean;
    has_link_column?: boolean;
    groups: Array<{
      name: string;
      tasks: Array<{
        title: string;
        details?: string;
        stage?: 'pre_event' | 'on_event' | 'post_event';
      }>;
    }>;
  }>;
}

export const ONLINE_TRACKER_TEMPLATE: TemplateStructure = {
  divisions: [
    {
      name: 'EVENT',
      groups: [
        {
          name: 'Rundown & MC',
          tasks: [
            { title: 'Penyusunan rundown kegiatan', details: 'Rundown menit per menit', stage: 'pre_event' },
            { title: 'Briefing pembicara & moderator', details: 'Penyamaan persepsi materi', stage: 'pre_event' },
            { title: 'Pemanduan sesi tanya jawab', details: 'Q&A Slido atau chat room', stage: 'on_event' },
          ],
        },
        {
          name: 'Platform & Teknis',
          tasks: [
            { title: 'Setup room Google Meet / Zoom', details: 'Cek audio dan video', stage: 'pre_event' },
            { title: 'Recording dan backup rekaman', details: 'Simpan ke cloud storage', stage: 'on_event' },
          ],
        },
      ],
    },
    {
      name: 'PUBLICATION',
      has_link_column: true,
      groups: [
        {
          name: 'Media & Konten',
          tasks: [
            { title: 'Desain poster kegiatan', details: 'Format feed & story Instagram', stage: 'pre_event' },
            { title: 'Publikasi tautan pendaftaran', details: 'Form registrasi GDG on Campus', stage: 'pre_event' },
            { title: 'Dokumentasi tangkapan layar', details: 'Foto bersama online', stage: 'on_event' },
          ],
        },
      ],
    },
    {
      name: 'E&C',
      has_budget_columns: true,
      groups: [
        {
          name: 'Anggaran & Doorprize',
          tasks: [
            { title: 'Pengadaan saldo e-wallet doorprize', details: 'Hadiah untuk penanya terbaik', stage: 'pre_event' },
          ],
        },
      ],
    },
  ],
};

export const OFFLINE_TRACKER_TEMPLATE: TemplateStructure = {
  divisions: [
    {
      name: 'EVENT',
      groups: [
        {
          name: 'Rundown & Acara',
          tasks: [
            { title: 'Finalisasi rundown dan jadwal', details: 'Alur kegiatan luring', stage: 'pre_event' },
            { title: 'Gladi resik panitia', details: 'Simulasi alur panggung', stage: 'pre_event' },
            { title: 'Pemanduan ice breaking', details: 'Sesi penyemangat peserta', stage: 'on_event' },
          ],
        },
      ],
    },
    {
      name: 'LOGISTICS',
      groups: [
        {
          name: 'Perlengkapan & Tempat',
          tasks: [
            { title: 'Perizinan dan booking ruangan', details: 'Gedung kampus UNSRI', stage: 'pre_event' },
            { title: 'Setup proyektor dan sound system', details: 'Uji koneksi HDMI & mic', stage: 'on_event' },
            { title: 'Pembersihan dan serah terima ruangan', details: 'Kerapian ruangan', stage: 'post_event' },
          ],
        },
      ],
    },
    {
      name: 'PUBLICATION',
      has_link_column: true,
      groups: [
        {
          name: 'Promosi & Dokumentasi',
          tasks: [
            { title: 'Cetak backdrop dan banner acara', details: 'Ukuran 3x2 meter', stage: 'pre_event' },
            { title: 'Dokumentasi foto & video luring', details: 'Kamera panitia', stage: 'on_event' },
            { title: 'Unggah arsip Google Drive', details: 'Tautan dokumentasi peserta', stage: 'post_event' },
          ],
        },
      ],
    },
    {
      name: 'E&C',
      has_budget_columns: true,
      groups: [
        {
          name: 'Konsumsi & Logistik Anggaran',
          tasks: [
            { title: 'Pemesanan snack box peserta', details: 'Sesuai jumlah registrasi', stage: 'pre_event' },
            { title: 'Plakat kenang-kenangan pemateri', details: 'Plakat akrilik GDGoC', stage: 'pre_event' },
          ],
        },
      ],
    },
  ],
};

// Fungsi membuat tracker lengkap dari template saat event dibuat
export function instantiateTrackerFromTemplate(
  eventId: string,
  eventType: EventType
): {
  divisions: TrackerDivision[];
  groups: TrackerGroup[];
  tasks: TrackerTask[];
} {
  const template =
    eventType === 'online' ? ONLINE_TRACKER_TEMPLATE : OFFLINE_TRACKER_TEMPLATE;

  const resultDivisions: TrackerDivision[] = [];
  const resultGroups: TrackerGroup[] = [];
  const resultTasks: TrackerTask[] = [];

  template.divisions.forEach((d, divIdx) => {
    const divId = `tdiv-${eventId}-${divIdx + 1}`;
    resultDivisions.push({
      id: divId,
      event_id: eventId,
      name: d.name,
      sort_order: divIdx + 1,
      has_budget_columns: Boolean(d.has_budget_columns),
      has_link_column: Boolean(d.has_link_column),
    });

    d.groups.forEach((g, grpIdx) => {
      const grpId = `tgrp-${divId}-${grpIdx + 1}`;
      resultGroups.push({
        id: grpId,
        tracker_division_id: divId,
        name: g.name,
        sort_order: grpIdx + 1,
      });

      g.tasks.forEach((t, taskIdx) => {
        const taskId = `task-${grpId}-${taskIdx + 1}`;
        resultTasks.push({
          id: taskId,
          group_id: grpId,
          title: t.title,
          details: t.details || '',
          status: 'not_started',
          pic: '',
          stage: t.stage || 'pre_event',
          deadline: '',
          notes: '',
          link: '',
          quantity: 1,
          unit_price: 0,
          buyer_name: '',
          receipt: '',
          sort_order: taskIdx + 1,
        });
      });
    });
  });

  return {
    divisions: resultDivisions,
    groups: resultGroups,
    tasks: resultTasks,
  };
}

