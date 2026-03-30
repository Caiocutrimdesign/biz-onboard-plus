import React, { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import type { User, LoginCredentials, AuthResponse, RegisterData } from '@/types/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  cadastrarUsuario: (data: RegisterData) => Promise<AuthResponse>;
  loginUsuario: (credentials: LoginCredentials) => Promise<AuthResponse>;
  getUserProfile: (id: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserProfile = useCallback(async (id: string): Promise<User | null> => {
    if (!isSupabaseConfigured() || !supabase) return null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.log('❌ Erro ao buscar perfil:', error.message);
        return null;
      }

      if (profile) {
        return {
          id: profile.id,
          email: profile.email || '', 
          name: profile.nome,
          tipo: profile.tipo as 'admin' | 'tecnico',
          role: profile.tipo as any, 
          created_at: profile.created_at || new Date().toISOString(),
          active: true,
        };
      }
    } catch (e: any) {
      console.log('❌ Erro inesperado em getUserProfile:', e.message);
    }
    return null;
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userMetadata = session.user.user_metadata;
        const userProfile = await getUserProfile(session.user.id);
        
        if (userProfile) {
          setUser({ ...userProfile, email: session.user.email || userProfile.email });
        } else {
          // Fallback to metadata to bypass RLS recursion issues
          const role = userMetadata?.tipo || userMetadata?.role || 'tecnico';
          const name = userMetadata?.nome || userMetadata?.name || session.user.email?.split('@')[0] || 'Usuário';
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: name,
            tipo: role as any, 
            role: role as any,
            created_at: session.user.created_at,
            active: true
          });
        }
      } else {
        setUser(null);
      }
    } catch (e: any) {
      console.log('❌ Erro ao atualizar usuário:', e.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [getUserProfile]);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      if (!isSupabaseConfigured() || !supabase) {
        if (mounted) setIsLoading(false);
        return;
      }

      // 1. Get initial session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            await refreshUser();
          } else {
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (e) {
        console.error("Auth init session error:", e);
        if (mounted) setIsLoading(false);
      }

      // 2. Listen for changes
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔔 Mudança no estado de autenticação:', event, session?.user?.id);
        if (mounted) {
          if (session?.user) {
            await refreshUser();
          } else {
            setUser(null);
            setIsLoading(false);
          }
        }
      });
      subscription = data.subscription;
    };

    initAuth();

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []); // Remove refreshUser from dependencies to avoid loops

  const cadastrarUsuario = async (data: RegisterData): Promise<AuthResponse> => {
    setIsLoading(true);
    console.log("🚀 Iniciando cadastro de usuário...");
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase não configurado');
      }

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.name,
            tipo: data.tipo || 'tecnico',
          }
        }
      });

      if (authError) {
        console.log("❌ Erro no signUp:", authError.message);
        alert("Erro ao cadastrar: " + authError.message);
        throw authError;
      }

      if (!authData.user) throw new Error('Erro ao criar usuário');

      // 2. Create profile in 'profiles' table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          nome: data.name,
          tipo: data.tipo || 'tecnico',
        });

      if (profileError) {
        console.log('❌ Erro ao criar perfil:', profileError.message);
        alert("Erro ao salvar perfil: " + profileError.message);
      }

      const newUser: User = {
        id: authData.user.id,
        email: data.email,
        name: data.name,
        tipo: data.tipo || 'tecnico',
        role: (data.tipo || 'tecnico') as any,
        created_at: authData.user.created_at,
      };

      console.log("✅ Usuário cadastrado com sucesso!");
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error: any) {
      console.log('❌ Erro de cadastro:', error.message);
      return { success: false, error: error.message || 'Erro ao cadastrar usuário' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginUsuario = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    console.log("🚀 Iniciando login de usuário...");
    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('Supabase não configurado');
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) {
        console.log("❌ Erro no signIn:", authError.message);
        
        let customMessage = authError.message;
        if (authError.message.includes('Email not confirmed')) {
          customMessage = "E-mail não confirmado. Por favor, verifique sua caixa de entrada ou confirme o usuário no Dashboard do Supabase.";
        } else if (authError.message.includes('Invalid login credentials')) {
          customMessage = "Email ou senha incorretos.";
        }
        
        toast.error(customMessage);
        throw new Error(customMessage);
      }

      if (!authData.user) throw new Error('Usuário não encontrado');

      const userProfile = await getUserProfile(authData.user.id);
      
      if (!userProfile) {
        console.log("⚠️ Perfil não encontrado, usando dados do metadados.");
        const metadata = authData.user.user_metadata;
        const role = metadata?.tipo || metadata?.role || 'tecnico';
        const name = metadata?.nome || metadata?.name || credentials.email.split('@')[0];

        const fallbackUser: User = {
          id: authData.user.id,
          email: authData.user.email || credentials.email,
          name: name,
          tipo: role as any,
          role: role as any,
          created_at: authData.user.created_at,
          active: true
        };
        setUser(fallbackUser);
        return { success: true, user: fallbackUser };
      }

      console.log("✅ Login realizado com sucesso! Tipo:", userProfile.tipo);
      setUser(userProfile);
      return { success: true, user: userProfile };
    } catch (error: any) {
      console.log('❌ Erro de login:', error.message);
      return { success: false, error: error.message || 'Erro ao entrar' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginUsuario, // Map existing login to loginUsuario
    logout,
    refreshUser,
    cadastrarUsuario,
    loginUsuario,
    getUserProfile,
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
