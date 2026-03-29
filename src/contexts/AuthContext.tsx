import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, AuthState, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (data: Partial<User>) => Promise<AuthResponse>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_TABLE = 'crm_users';
const SESSION_KEY = 'biz_crm_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const setUser = useCallback((user: User | null) => {
    setState({
      user,
      isLoading: false,
      isAuthenticated: !!user,
    });
    
    if (user) {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({
          user,
          timestamp: Date.now(),
        }));
      } catch (e) {
        console.error('Failed to persist session:', e);
      }
    } else {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem('admin_auth');
    }
  }, []);

  const loadStoredSession = useCallback(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const { user, timestamp } = JSON.parse(stored);
        const sessionAge = Date.now() - timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        
        if (sessionAge < maxAge) {
          return user;
        }
      }
    } catch (e) {
      console.error('Failed to load stored session:', e);
    }
    return null;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        if (credentials.email === 'admin@rastremix.com' && credentials.password === 'Rastremix2024!') {
          const demoUser: User = {
            id: 'demo-admin-001',
            email: 'admin@rastremix.com',
            name: 'Administrador',
            role: 'admin',
            created_at: new Date().toISOString(),
            active: true,
          };
          setUser(demoUser);
          return { success: true, user: demoUser };
        }
        
        return { success: false, error: 'Sistema de autenticação não disponível. Configure o Supabase.' };
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      const { data: userData, error: userError } = await supabase
        .from(USERS_TABLE)
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        const newUser: User = {
          id: authData.user.id,
          email: authData.user.email || credentials.email,
          name: authData.user.user_metadata?.name || credentials.email.split('@')[0],
          role: 'user',
          created_at: authData.user.created_at,
          active: true,
        };
        setUser(newUser);
        return { success: true, user: newUser };
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'user',
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        last_sign_in_at: new Date().toISOString(),
        active: userData.active,
        phone: userData.phone,
        department: userData.department,
      };

      await supabase
        .from(USERS_TABLE)
        .update({ last_sign_in_at: new Date().toISOString() })
        .eq('id', user.id);

      setUser(user);
      return { success: true, user };

    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Erro ao fazer login' };
    }
  }, [setUser]);

  const register = useCallback(async (data: RegisterData): Promise<AuthResponse> => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Sistema de autenticação não disponível' };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role || 'user',
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Falha ao criar usuário' };
      }

      const { error: insertError } = await supabase.from(USERS_TABLE).insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role || 'user',
        phone: data.phone,
        active: true,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Failed to insert user profile:', insertError);
      }

      const user: User = {
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role || 'user',
        created_at: new Date().toISOString(),
        active: true,
        phone: data.phone,
      };

      setUser(user);
      return { success: true, user };

    } catch (error: any) {
      console.error('Register error:', error);
      return { success: false, error: error.message || 'Erro ao criar conta' };
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  }, [setUser]);

  const resetPassword = useCallback(async (email: string): Promise<AuthResponse> => {
    try {
      if (!isSupabaseConfigured() || !supabase) {
        return { success: false, error: 'Sistema de recuperação não disponível' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao enviar email de recuperação' };
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<AuthResponse> => {
    try {
      if (!state.user) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from(USERS_TABLE)
          .update(data)
          .eq('id', state.user.id);

        if (error) {
          return { success: false, error: error.message };
        }
      }

      const updatedUser = { ...state.user, ...data };
      setUser(updatedUser);
      return { success: true, user: updatedUser };

    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao atualizar perfil' };
    }
  }, [state.user, setUser]);

  const refreshSession = useCallback(async () => {
    try {
      if (!isSupabaseConfigured() || !supabase) return;

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        setUser(null);
        return;
      }

      const { data: userData } = await supabase
        .from(USERS_TABLE)
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar_url: userData.avatar_url,
          created_at: userData.created_at,
          active: userData.active,
          phone: userData.phone,
        };
        setUser(user);
      } else {
        setUser(null);
      }

    } catch (error) {
      console.error('Session refresh error:', error);
      setUser(null);
    }
  }, [setUser]);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = loadStoredSession();
      
      if (storedUser && isSupabaseConfigured() && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setState({
              user: storedUser,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else if (storedUser) {
        setState({
          user: storedUser,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: userData } = await supabase
            .from(USERS_TABLE)
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            const user: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              avatar_url: userData.avatar_url,
              created_at: userData.created_at,
              active: userData.active,
            };
            setUser(user);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [loadStoredSession, setUser]);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    refreshSession,
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
