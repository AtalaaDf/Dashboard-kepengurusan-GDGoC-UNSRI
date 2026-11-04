import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ANIMATIONS } from '@/lib/animations';

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
    </div>
  );
};
