import type { UserRole } from '@/types';

export interface DummyAccount {
  email: string;
  role: UserRole;
  name: string;
}

export const DUMMY_ACCOUNTS: DummyAccount[] = [
  {
    email: 'superadmin@gdgocunsri.org',
    role: 'superadmin',
    name: 'Lead / Superadmin',
  },
  {
    email: 'admin@gdgocunsri.org',
    role: 'admin',
    name: 'Admin Organisasi',
  },
  {
    email: 'treasurer@gdgocunsri.org',
    role: 'executive',
    name: 'Treasurer / Executive',
  },
  {
    email: 'po@gdgocunsri.org',
    role: 'po',
    name: 'Project Officer (PO)',
  },
];

export const DUMMY_PASSWORD = 'password123';

