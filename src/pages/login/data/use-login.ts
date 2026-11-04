import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/data/auth/auth-context';
import { loginSchema } from './login.schema';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn } = useAuth();
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
    handleSubmit,
  };
}

