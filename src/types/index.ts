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

