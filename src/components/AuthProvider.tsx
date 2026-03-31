import { createContext, useContext, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AUTH_KEY = 're7set-auth';

interface AuthContextType {
  isAuthenticated: boolean;
  signIn: (password: string) => Promise<boolean>;
  signOut: () => void;
  changePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false, signIn: async () => false, signOut: () => {}, changePassword: async () => {} });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem(AUTH_KEY) === 'true');

  const signIn = async (password: string) => {
    const { data } = await supabase.from('app_settings').select('value').eq('key', 'app_password').single();
    const storedPassword = data?.value || 'RE7SET2k26';
    if (password === storedPassword) {
      localStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const signOut = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  };

  const changePassword = async (newPassword: string) => {
    await supabase.from('app_settings').update({ value: newPassword, updated_at: new Date().toISOString() }).eq('key', 'app_password');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
