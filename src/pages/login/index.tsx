import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/data/auth/auth-context';
import { FloatingOrnaments } from '@/components/common/FloatingOrnaments';
import { useLogin } from './data/use-login';
import { LoginFormSection } from './sections/LoginFormSection';

export const LoginPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const {
    email,
    password,
    emailError,
    passwordError,
    formError,
    isSubmitting,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useLogin();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-white">
      <FloatingOrnaments variant="overlay" />

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <LoginFormSection
          emailValue={email}
          passwordValue={password}
          onEmailChange={handleEmailChange}
          onPasswordChange={handlePasswordChange}
          emailError={emailError}
          passwordError={passwordError}
          formError={formError}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
