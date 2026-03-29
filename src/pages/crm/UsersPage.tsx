import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Search, MoreVertical, Edit2, Trash2,
  Shield, Eye, EyeOff, CheckCircle, XCircle, Loader2,
  AlertCircle, Mail, Lock, User, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface CRMUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'user';
  active: boolean;
  created_at: string;
  last_sign_in?: string;
}

const ROLES = {
  admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-800', icon: Shield },
  employee: { label: 'Funcionário', color: 'bg-blue-100 text-blue-800', icon: User },
  user: { label: 'Usuário', color: 'bg-gray-100 text-gray-800', icon: Eye },
};

const STORAGE_KEY = 'biz_crm_users';

export default function UsersManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<CRMUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee' | 'user',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('crm_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        setUsers(stored ? JSON.parse(stored) : []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      const stored = localStorage.getItem(STORAGE_KEY);
      setUsers(stored ? JSON.parse(stored) : []);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (usersList: CRMUser[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usersList));
    setUsers(usersList);
  };

  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'biz_crm_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setFormError('Preencha todos os campos');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Email inválido');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const passwordHash = await hashPassword(formData.password);

      const newUser: CRMUser = {
        id: `user_${Date.now()}`,
        email: formData.email,
        name: formData.name,
        role: formData.role,
        active: true,
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('crm_users')
          .insert({ ...newUser, password_hash: passwordHash });

        if (error) throw error;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      const usersList = stored ? JSON.parse(stored) : [];
      usersList.push(newUser);
      saveToStorage(usersList);

      const authUsers = JSON.parse(localStorage.getItem('biz_crm_auth') || '{}');
      authUsers[formData.email] = { hash: passwordHash, userId: newUser.id };
      localStorage.setItem('biz_crm_auth', JSON.stringify(authUsers));

      setShowModal(false);
      resetForm();
      loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !formData.name || !formData.email) {
      setFormError('Preencha todos os campos');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const updated: Partial<CRMUser> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        if (formData.password.length < 6) {
          setFormError('Senha deve ter pelo menos 6 caracteres');
          setSaving(false);
          return;
        }
        const passwordHash = await hashPassword(formData.password);
        const authUsers = JSON.parse(localStorage.getItem('biz_crm_auth') || '{}');
        authUsers[formData.email] = { hash: passwordHash, userId: editingUser.id };
        localStorage.setItem('biz_crm_auth', JSON.stringify(authUsers));
      }

      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('crm_users')
          .update(updated)
          .eq('id', editingUser.id);

        if (error) throw error;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      const usersList: CRMUser[] = stored ? JSON.parse(stored) : [];
      const idx = usersList.findIndex(u => u.id === editingUser.id);
      if (idx !== -1) {
        usersList[idx] = { ...usersList[idx], ...updated };
        saveToStorage(usersList);
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: CRMUser) => {
    const newStatus = !user.active;

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('crm_users')
        .update({ active: newStatus })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user:', error);
        return;
      }
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    const usersList: CRMUser[] = stored ? JSON.parse(stored) : [];
    const idx = usersList.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      usersList[idx].active = newStatus;
      saveToStorage(usersList);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('crm_users')
          .delete()
          .eq('id', userId);

        if (error) throw error;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      const usersList: CRMUser[] = stored ? JSON.parse(stored) : [];
      saveToStorage(usersList.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
    setDeleteConfirm(null);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'employee' });
    setFormError('');
    setShowPassword(false);
  };

  const openEditModal = (user: CRMUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowModal(true);
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-muted-foreground">Apenas administradores podem gerenciar usuários.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Crie e gerencie acessos ao sistema</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const role = ROLES[user.role] || ROLES.user;
                const RoleIcon = role.icon;

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors hover:bg-muted/50 ${
                      !user.active ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{user.name}</p>
                        {!user.active && (
                          <Badge variant="outline" className="text-xs">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>

                    <Badge className={role.color}>
                      <RoleIcon className="w-3 h-3 mr-1" />
                      {role.label}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(user)}
                        title={user.active ? 'Desativar' : 'Ativar'}
                      >
                        {user.active ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(user)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      {user.id !== currentUser?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteConfirm(user.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome completo"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? '••••••••' : 'Mínimo 6 caracteres'}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Função</label>
              <Select
                value={formData.role}
                onValueChange={(v) => setFormData({ ...formData, role: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="employee">Funcionário</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); setEditingUser(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={editingUser ? handleUpdateUser : handleCreateUser} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {editingUser ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDeleteUser(deleteConfirm)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
