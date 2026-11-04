import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types';
import { DUMMY_ACCOUNTS } from './dummy-accounts';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInAsDummy: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DUMMY_STORAGE_KEY = 'gdgoc_dummy_auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfileRole = async (userId: string): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }
      return data.role as UserRole;
    } catch {
      return null;
    }
  };

  const createDummyUser = (accountRole: UserRole, email: string): User => {
    return {
      id: `dummy-${accountRole}`,
      app_metadata: {},
      user_metadata: { role: accountRole },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email,
    } as unknown as User;
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        // Periksa apakah ada sesi dummy lokal terlebih dahulu
        const storedDummy = localStorage.getItem(DUMMY_STORAGE_KEY);
        if (storedDummy) {
          try {
            const parsed = JSON.parse(storedDummy) as { role: UserRole; email: string };
            if (isMounted) {
              setRole(parsed.role);
              setUser(createDummyUser(parsed.role, parsed.email));
              setIsLoading(false);
              return;
            }
          } catch {
            localStorage.removeItem(DUMMY_STORAGE_KEY);
          }
        }

        // Cek sesi Supabase jika tidak ada dummy
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const userRole = await fetchProfileRole(initialSession.user.id);
          if (isMounted) {
            setRole(userRole);
          }
        } else {
          setRole(null);
        }
      } catch {
        if (isMounted) {
          setRole(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        // Jangan override jika sedang mode dummy aktif
        if (localStorage.getItem(DUMMY_STORAGE_KEY)) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const userRole = await fetchProfileRole(newSession.user.id);
          if (isMounted) {
            setRole(userRole);
          }
        } else {
          setRole(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInAsDummy = (targetRole: UserRole) => {
    const match = DUMMY_ACCOUNTS.find((a) => a.role === targetRole) || DUMMY_ACCOUNTS[0];
    localStorage.setItem(
      DUMMY_STORAGE_KEY,
      JSON.stringify({ role: match.role, email: match.email })
    );
    setUser(createDummyUser(match.role, match.email));
    setRole(match.role);
    setSession(null);
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    // 1. Cek kecocokan dengan akun dummy untuk testing lokal
    const matchedDummy = DUMMY_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedDummy) {
      // Izinkan login dummy
      signInAsDummy(matchedDummy.role);
      return { error: null };
    }

    // 2. Jika bukan dummy, coba autentikasi Supabase live
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: 'Email atau kata sandi tidak sesuai.' };
      }

      if (data.user) {
        const userRole = await fetchProfileRole(data.user.id);
        setRole(userRole);
      }

      return { error: null };
    } catch {
      return { error: 'Terjadi kesalahan saat masuk. Silakan coba lagi.' };
    }
  };

  const signOut = async (): Promise<void> => {
    localStorage.removeItem(DUMMY_STORAGE_KEY);
    try {
      await supabase.auth.signOut();
    } catch {
      // Abaikan bila network offline
    }
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isLoading,
        signIn,
        signOut,
        signInAsDummy,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
