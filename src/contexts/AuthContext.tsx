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
const USERS_KEY = 'rastremix_users';

function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(16);
}

function verifyPasswordHash(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (storedHash.startsWith('hash_')) {
    return simpleHash(password) === storedHash;
  }
  return password === storedHash;
}

function verifyPassword(password: string, hash: string): boolean {
  return simpleHash(password) === hash || password === hash;
}

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
    const tecnicos: TecnicoUser[] = data ? JSON.parse(data) : [];
    
    const users = getUsers();
    const userTecnicos = users
      .filter(u => u.role === 'technician')
      .map(u => ({
        id: u.id.replace('user_', ''),
        email: u.email,
        name: u.name,
        phone: u.phone || '',
        cpf: u.cpf || '',
        active: u.active ?? true,
        created_at: u.created_at,
      }));
    
    const merged = [...tecnicos];
    userTecnicos.forEach(ut => {
      if (!merged.find(t => t.email.toLowerCase() === ut.email.toLowerCase())) {
        merged.push(ut);
      }
    });
    
    return merged;
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

export function getUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveUser(user: User & { password?: string }) {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  const userData: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active ?? true,
    created_at: user.created_at || new Date().toISOString(),
    last_login_at: user.last_login_at,
    phone: user.phone,
    cpf: user.cpf,
    password_hash: user.password ? simpleHash(user.password) : user.password_hash,
    must_change_password: user.must_change_password ?? false,
    online: user.online ?? false,
  };
  
  if (existingIndex >= 0) {
    users[existingIndex] = userData;
  } else {
    users.push(userData);
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function updateUser(id: string, data: Partial<User & { password?: string }>) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...data };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

export function deleteUser(id: string) {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getTechnicians(): User[] {
  return getUsers().filter(u => u.role === 'technician' && u.active !== false);
}

export function migrateTecnicosToUsers() {
  const tecnicos = getTecnicos();
  const users = getUsers();
  
  tecnicos.forEach(tecnico => {
    const existingUser = users.find(u => u.email.toLowerCase() === tecnico.email.toLowerCase());
    if (!existingUser) {
      const userId = `user_${tecnico.id}`;
      saveUser({
        id: userId,
        email: tecnico.email,
        name: tecnico.name,
        role: 'technician',
        active: tecnico.active,
        created_at: tecnico.created_at,
        phone: tecnico.phone,
        cpf: tecnico.cpf,
        password: tecnico.password || 'Rastremix2024!',
      });
    }
  });
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
    
    migrateTecnicosToUsers();
    
    try {
      console.log('Auth attempt:', { email: emailLower, passwordLength: password.length, passwordValue: password });
      
      if (emailLower === 'admin@rastremix.com' && password === 'Rastremix2024!') {
        console.log('Demo admin login success');
        const demoUser: User = {
          id: 'admin-001',
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

      const dbUser = findUserByEmail(emailLower);
      console.log('DB User lookup:', { email: emailLower, found: !!dbUser, user: dbUser?.email });
      if (dbUser) {
        const storedHash = dbUser.password_hash || '';
        const isValidPassword = verifyPasswordHash(password, storedHash);
        console.log('Password check:', { storedHash, isValidPassword, passwordLength: password.length });
        
        if (!isValidPassword) {
          setIsLoading(false);
          return { success: false, error: 'Senha incorreta' };
        }
        
        if (dbUser.active === false) {
          setIsLoading(false);
          return { success: false, error: 'Usuário inativo. Contacte o administrador.' };
        }
        
        const loggedInUser: User = {
          ...dbUser,
          last_login_at: new Date().toISOString(),
          online: true,
        };
        
        updateUser(dbUser.id, { last_login_at: loggedInUser.last_login_at, online: true });
        
        const sessionData = {
          user: loggedInUser,
          timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setUser(loggedInUser);
        setIsLoading(false);
        return { success: true, user: loggedInUser };
      }

      const tecnico = findTecnicoByEmail(emailLower);
      if (tecnico) {
        console.log('Technician found:', tecnico.email, { storedPwdLength: tecnico.password?.length, enteredPwdLength: password.length });
        const storedPwd = (tecnico.password || '').trim();
        const enteredPwd = password.trim();
        
        if (storedPwd !== enteredPwd) {
          console.log('Password mismatch:', { storedPwd, enteredPwd, equal: storedPwd === enteredPwd });
          setIsLoading(false);
          return { success: false, error: 'Senha incorreta' };
        }
        
        if (!tecnico.active) {
          setIsLoading(false);
          return { success: false, error: 'Técnico inativo. Contacte o administrador.' };
        }
        
        let userForSession = dbUser;
        if (!userForSession) {
          userForSession = {
            id: tecnico.id,
            email: tecnico.email,
            name: tecnico.name,
            role: 'technician' as const,
            active: tecnico.active,
            created_at: tecnico.created_at,
            phone: tecnico.phone,
            cpf: tecnico.cpf,
          };
          const userId = `user_${tecnico.id}`;
          saveUser({
            id: userId,
            email: tecnico.email,
            name: tecnico.name,
            role: 'technician',
            active: tecnico.active,
            phone: tecnico.phone,
            cpf: tecnico.cpf,
            password: tecnico.password,
            created_at: tecnico.created_at,
          });
        }
        
        const sessionData = {
          user: userForSession,
          timestamp: Date.now(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        setUser(userForSession);
        setIsLoading(false);
        return { success: true, user: userForSession };
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

      console.log('No user found in any system, login failed');
      setIsLoading(false);
      return { success: false, error: 'Credenciais inválidas. Verifique seu e-mail e senha.' };

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
