import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/data/auth/auth-context';
import type { UserRole } from '@/types';
import { loginSchema } from './login.schema';
import { DUMMY_PASSWORD } from '@/data/auth/dummy-accounts';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, signInAsDummy } = useAuth();
  const navigate = useNavigate();

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (emailError) setEmailError(undefined);
    if (formError) setFormError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (passwordError) setPasswordError(undefined);
    if (formError) setFormError(null);
  };

  const handleQuickLoginAsRole = (role: UserRole) => {
    signInAsDummy(role);
    navigate('/dashboard', { replace: true });
  };

  const handleFillDummy = (dummyEmail: string) => {
    setEmail(dummyEmail);
    setPassword(DUMMY_PASSWORD);
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(null);

    const validationResult = loginSchema.safeParse({ email, password });

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      if (fieldErrors.email?.[0]) {
        setEmailError(fieldErrors.email[0]);
      }
      if (fieldErrors.password?.[0]) {
        setPasswordError(fieldErrors.password[0]);
      }
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return {
    email,
    password,
    emailError,
    passwordError,
    formError,
    isSubmitting,
    handleEmailChange,
    handlePasswordChange,
    handleQuickLoginAsRole,
    handleFillDummy,
    handleSubmit,
  };
}
