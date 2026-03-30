import React, { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, AuthResponse } from '@/types/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = 'biz_crm_session';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: crmUser } = await supabase
          .from('crm_users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (crmUser) {
          const loggedInUser: User = {
            id: crmUser.id,
            email: crmUser.email,
            name: crmUser.name,
            role: crmUser.role || 'user',
            phone: crmUser.phone,
            active: crmUser.active ?? true,
            created_at: crmUser.created_at,
            last_login_at: new Date().toISOString(),
            online: true,
          };
          setUser(loggedInUser);
          
          await supabase
            .from('crm_users')
            .update({ last_login_at: loggedInUser.last_login_at, online: true })
            .eq('id', crmUser.id);
          
          const sessionData = {
            user: loggedInUser,
            timestamp: Date.now(),
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        }
      }
    } catch (e) {
      console.error('Error refreshing user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
          const data = JSON.parse(session);
          if (data.user) {
            setUser(data.user);
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await refreshUser();
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem(SESSION_KEY);
            setUser(null);
          }
        });

        await refreshUser();

        return () => {
          subscription.unsubscribe();
        };
      } catch (e) {
        console.error('Auth init error:', e);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    
    const emailLower = credentials.email.toLowerCase().trim();
    const password = credentials.password.trim();
    
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data: crmUser, error: crmError } = await supabase
          .from('crm_users')
          .select('*')
          .eq('email', emailLower)
          .single();

        if (crmUser && !crmError && crmUser.password) {
          if (crmUser.password === password) {
            if (crmUser.active === false) {
              setIsLoading(false);
              return { success: false, error: 'Usuário inativo. Contacte o administrador.' };
            }

            const loggedInUser: User = {
              id: crmUser.id,
              email: crmUser.email,
              name: crmUser.name,
              role: (crmUser.role as any) || 'user',
              phone: crmUser.phone,
              active: crmUser.active ?? true,
              created_at: crmUser.created_at,
              last_login_at: new Date().toISOString(),
              online: true,
            };

            await supabase
              .from('crm_users')
              .update({ last_login_at: loggedInUser.last_login_at, online: true })
              .eq('id', crmUser.id);

            const sessionData = {
              user: loggedInUser,
              timestamp: Date.now(),
            };
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
            setUser(loggedInUser);
            setIsLoading(false);
            return { success: true, user: loggedInUser };
          } else {
            setIsLoading(false);
            return { success: false, error: 'Senha incorreta' };
          }
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: emailLower,
          password: password,
        });

        if (authError) {
          setIsLoading(false);
          return { success: false, error: authError.message };
        }

        if (!authData.user) {
          setIsLoading(false);
          return { success: false, error: 'Usuário não encontrado' };
        }

        const { data: crmUserData } = await supabase
          .from('crm_users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        let loggedInUser: User;

        if (crmUserData) {
          loggedInUser = {
            id: crmUserData.id,
            email: crmUserData.email,
            name: crmUserData.name,
            role: crmUserData.role || 'user',
            phone: crmUserData.phone,
            active: crmUserData.active ?? true,
            created_at: crmUserData.created_at,
            last_login_at: new Date().toISOString(),
            online: true,
          };

          await supabase
            .from('crm_users')
            .update({ last_login_at: loggedInUser.last_login_at, online: true })
            .eq('id', crmUserData.id);
        } else {
          loggedInUser = {
            id: authData.user.id,
            email: authData.user.email || emailLower,
            name: authData.user.user_metadata?.name || emailLower.split('@')[0],
            role: 'user',
            created_at: authData.user.created_at,
            active: true,
            last_login_at: new Date().toISOString(),
            online: true,
          };

          await supabase.from('crm_users').insert({
            id: loggedInUser.id,
            email: loggedInUser.email,
            name: loggedInUser.name,
            role: loggedInUser.role,
            active: true,
            created_at: loggedInUser.created_at,
            last_login_at: loggedInUser.last_login_at,
            online: true,
          });
        }

        const sessionData = {
          user: loggedInUser,
          timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setUser(loggedInUser);
        setIsLoading(false);
        return { success: true, user: loggedInUser };
      }

      setIsLoading(false);
      return { success: false, error: 'Sistema não configurado. Contacte o administrador.' };

    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message || 'Erro ao fazer login' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured() && supabase && user) {
        await supabase
          .from('crm_users')
          .update({ online: false })
          .eq('id', user.id);
        
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem('admin_auth');
      setUser(null);
    }
  }, [user]);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
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
