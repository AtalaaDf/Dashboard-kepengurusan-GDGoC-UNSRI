import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ANIMATIONS } from '@/lib/animations';
import { DUMMY_ACCOUNTS } from '@/data/auth/dummy-accounts';
import type { UserRole } from '@/types';

export interface LoginFormSectionProps {
  emailValue: string;
  passwordValue: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  emailError?: string;
  passwordError?: string;
  formError?: string | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onQuickLogin: (role: UserRole) => void;
}

export const LoginFormSection: React.FC<LoginFormSectionProps> = ({
  emailValue,
  passwordValue,
  onEmailChange,
  onPasswordChange,
  emailError,
  passwordError,
  formError,
  isSubmitting,
  onSubmit,
  onQuickLogin,
}) => {
  return (
    <div className={`w-full max-w-md bg-white border border-[#1e1e1e]/10 rounded-2xl p-8 relative z-10 ${ANIMATIONS.PAGE_FADE_IN}`}>
      <div className="flex flex-col items-center text-center mb-8">
        <img
          src="/logoGDG.png"
          alt="Logo GDG on Campus"
          className="h-10 w-auto mb-4 object-contain"
        />
        <h1 className="text-2xl font-semibold text-[#1e1e1e] tracking-tight">
          Masuk ke Dashboard
        </h1>
        <p className="text-sm text-[#1e1e1e]/60 mt-1">
          Gunakan akun jabatan yang telah terdaftar
        </p>
      </div>

      {formError && (
        <div className="mb-5 p-3 rounded-lg bg-[#f8d8d8] text-[#ea4335] text-xs font-medium border border-[#ea4335]/20">
          {formError}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">Email Akun Jabatan</Label>
          <Input
            id="login-email"
            type="email"
            placeholder="nama@gdgocunsri.org"
            value={emailValue}
            onChange={(e) => onEmailChange(e.target.value)}
            isError={Boolean(emailError)}
            autoComplete="email"
            disabled={isSubmitting}
          />
          {emailError && (
            <p className="text-xs text-[#ea4335]">{emailError}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="login-password">Kata Sandi</Label>
          <Input
            id="login-password"
            type="password"
            placeholder="Masukkan kata sandi"
            value={passwordValue}
            onChange={(e) => onPasswordChange(e.target.value)}
            isError={Boolean(passwordError)}
            autoComplete="current-password"
            disabled={isSubmitting}
          />
          {passwordError && (
            <p className="text-xs text-[#ea4335]">{passwordError}</p>
          )}
        </div>

        <div className="mt-2">
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </div>
      </form>

      {/* Bagian Uji Coba Akun Jabatan Dummy */}
      <div className="mt-8 pt-6 border-t border-[#1e1e1e]/10">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs font-medium text-[#1e1e1e]">Uji Coba Cepat (Mode Dummy)</p>
            <p className="text-xs text-[#1e1e1e]/60 mt-0.5">
              Pilih peran akun jabatan untuk mencoba sidebar dan antarmuka tanpa Supabase:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            {DUMMY_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => onQuickLogin(acc.role)}
                className="text-left p-2.5 rounded-lg border border-[#1e1e1e]/10 bg-[#f0f0f0]/60 hover:bg-[#c3ecf6]/40 hover:border-[#4285f4]/40 transition-colors"
              >
                <p className="text-xs font-semibold text-[#1e1e1e]">{acc.name}</p>
                <p className="text-[11px] text-[#1e1e1e]/60 truncate">{acc.email}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
