import React, { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import type { User, LoginCredentials, AuthResponse } from '@/types/auth';
import { isSupabaseConfigured } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = 'biz_crm_session';
const TECNICOS_KEY = 'rastremix_tecnicos';

interface TecnicoUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  phone: string;
  cpf: string;
  active: boolean;
  created_at: string;
}

export function getTecnicos(): TecnicoUser[] {
  try {
    const data = localStorage.getItem(TECNICOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTecnico(tecnico: TecnicoUser) {
  const tecnicos = getTecnicos();
  tecnicos.push(tecnico);
  localStorage.setItem(TECNICOS_KEY, JSON.stringify(tecnicos));
}

export function updateTecnico(id: string, data: Partial<TecnicoUser>) {
  const tecnicos = getTecnicos();
  const index = tecnicos.findIndex(t => t.id === id);
  if (index !== -1) {
    tecnicos[index] = { ...tecnicos[index], ...data };
    localStorage.setItem(TECNICOS_KEY, JSON.stringify(tecnicos));
  }
}

export function deleteTecnico(id: string) {
  const tecnicos = getTecnicos().filter(t => t.id !== id);
  localStorage.setItem(TECNICOS_KEY, JSON.stringify(tecnicos));
}

export function findTecnicoByEmail(email: string): TecnicoUser | undefined {
  return getTecnicos().find(t => t.email.toLowerCase() === email.toLowerCase());
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const data = JSON.parse(session);
        return data.user || null;
      }
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    
    const emailLower = credentials.email.toLowerCase().trim();
    const password = credentials.password;
    
    try {
      if (emailLower === 'admin@rastremix.com' && password === 'Rastremix2024!') {
        const demoUser: User = {
          id: 'demo-admin-001',
          email: 'admin@rastremix.com',
          name: 'Administrador',
          role: 'admin',
          created_at: new Date().toISOString(),
          active: true,
        };
        
        const sessionData = {
          user: demoUser,
          timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setUser(demoUser);
        setIsLoading(false);
        return { success: true, user: demoUser };
      }

      if (emailLower === 'tecnico@rastremix.com' && password === 'Rastremix2024!') {
        const demoUser: User = {
          id: 'demo-admin-001',
          email: 'admin@rastremix.com',
          name: 'Administrador',
          role: 'admin',
          created_at: new Date().toISOString(),
          active: true,
        };
        
        const sessionData = {
          user: demoUser,
          timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setUser(demoUser);
        setIsLoading(false);
        return { success: true, user: demoUser };
      }

      const tecnico = findTecnicoByEmail(emailLower);
      if (tecnico) {
        if (tecnico.password !== password) {
          setIsLoading(false);
          return { success: false, error: 'Senha incorreta' };
        }
        if (!tecnico.active) {
          setIsLoading(false);
          return { success: false, error: 'Técnico inativo. Contacte o administrador.' };
        }
        const techUser: User = {
          id: tecnico.id,
          email: tecnico.email,
          name: tecnico.name,
          role: 'technician',
          created_at: tecnico.created_at,
          active: tecnico.active,
          phone: tecnico.phone,
          cpf: tecnico.cpf,
        };
        const sessionData = {
          user: techUser,
          timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setUser(techUser);
        setIsLoading(false);
        return { success: true, user: techUser };
      }

      if (isSupabaseConfigured() && supabase) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (authError) {
          setIsLoading(false);
          return { success: false, error: authError.message };
        }

        if (!authData.user) {
          setIsLoading(false);
          return { success: false, error: 'Usuario nao encontrado' };
        }

        const user: User = {
          id: authData.user.id,
          email: authData.user.email || credentials.email,
          name: authData.user.user_metadata?.name || credentials.email.split('@')[0],
          role: 'user',
          created_at: authData.user.created_at,
          active: true,
        };

        const sessionData = {
          user,
          timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setUser(user);
        setIsLoading(false);
        return { success: true, user };
      }

      setIsLoading(false);
      return { success: false, error: 'Credenciais invalidas' };

    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message || 'Erro ao fazer login' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem('admin_auth');
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
