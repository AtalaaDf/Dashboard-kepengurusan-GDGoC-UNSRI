import React from 'react';
import { useAuth } from '@/data/auth/auth-context';
import { ANIMATIONS } from '@/lib/animations';

export const DashboardPage: React.FC = () => {
  const { role } = useAuth();

  return (
    <div className={`flex flex-col gap-6 ${ANIMATIONS.PAGE_FADE_IN}`}>
      <div>
        <h1 className="text-2xl font-semibold text-[#1e1e1e]">Dashboard</h1>
        <p className="text-sm text-[#1e1e1e]/60 mt-1">
          Ringkasan data organisasi GDGoC UNSRI
        </p>
      </div>

      <div className="p-6 rounded-xl border border-[#1e1e1e]/10 bg-white">
        <p className="text-sm text-[#1e1e1e]">
          Selamat datang. Anda masuk dengan peran:{' '}
          <span className="font-semibold">{role || 'Pengguna'}</span>.
        </p>
      </div>
    </div>
  );
};

