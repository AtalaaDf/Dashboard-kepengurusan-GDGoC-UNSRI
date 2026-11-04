export type UserRole = 'superadmin' | 'admin' | 'executive' | 'po';

export interface UserProfile {
  id: string;
  role: UserRole;
}

export interface Batch {
  id: string;
  name: string;
  year: number;
  kas_month_start: number;
  kas_month_end: number;
  monthly_fee: number;
  monthly_fine: number;
  max_absences: number;
  is_active: boolean;
  created_at?: string;
}

export type DivisionType = 'technical' | 'non_technical';

export interface Division {
  id: string;
  name: string;
  type: DivisionType;
  created_at?: string;
}

export type MemberStatus = 'active' | 'inactive';

export interface Member {
  id: string;
  batch_id: string;
  division_id: string;
  full_name: string;
  status: MemberStatus;
  created_at?: string;
}

export type EventType = 'online' | 'offline';
export type EventStatus = 'active' | 'cancelled';

export interface OrganizationEvent {
  id: string;
  batch_id: string;
  name: string;
  event_date: string;
  type: EventType;
  status: EventStatus;
  attendance_finalized: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Attendance {
  id: string;
  event_id: string;
  member_id: string;
  recorded_by_role: UserRole;
  created_at?: string;
}
