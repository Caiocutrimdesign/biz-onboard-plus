import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserPlus, Search, Edit2, Trash2,
  Shield, Eye, EyeOff, CheckCircle, XCircle, Loader2,
  AlertCircle, Mail, Phone, User, Wrench, Copy, Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { unifiedDataService, type UnifiedTecnico } from '@/lib/unifiedDataService';

interface Tecnico {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password?: string;
  active: boolean;
  created_at: string;
}

export default function TechniciansPage() {
  const { user } = useAuth();
  const [technicians, setTechnicians] = useState<Tecnico[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTech, setEditingTech] = useState<Tecnico | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({ email: '', password: '' });
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
    active: true,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    setLoading(true);
    try {
      const data = await unifiedDataService.getTecnicos();
      setTechnicians(data.map((t: UnifiedTecnico) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        cpf: t.cpf,
        active: t.active,
        created_at: t.created_at,
      })));
    } catch (e) {
      console.error('Error loading technicians:', e);
    }
    setLoading(false);
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const filteredTechnicians = technicians.filter(t => 
    !search || 
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormError('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Email é obrigatório');
      return false;
    }
    if (!formData.phone.trim()) {
      setFormError('Telefone é obrigatório');
      return false;
    }
    if (!formData.cpf.trim()) {
      setFormError('CPF é obrigatório');
      return false;
    }

    if (!editingTech) {
      if (!formData.password) {
        setFormError('Senha é obrigatória');
        return false;
      }
      if (formData.password.length < 6) {
        setFormError('Senha deve ter pelo menos 6 caracteres');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('As senhas não coincidem');
        return false;
      }

      const existingTech = technicians.find(t => t.email.toLowerCase() === formData.email.toLowerCase());
      if (existingTech) {
        setFormError('Email já está cadastrado');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setFormError('');

    try {
      if (editingTech) {
        const updateData: any = {
          id: editingTech.id,
          name: formData.name,
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone,
          cpf: formData.cpf,
          active: formData.active,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await unifiedDataService.saveTecnico(updateData);
      } else {
        const newTecnico = await unifiedDataService.saveTecnico({
          name: formData.name,
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone,
          cpf: formData.cpf,
          active: formData.active,
          password: formData.password,
        });
        
        setSuccessData({ email: newTecnico.email, password: formData.password });
        setShowSuccessModal(true);
      }
      
      setShowModal(false);
      setEditingTech(null);
      setFormData({ name: '', email: '', phone: '', cpf: '', password: '', confirmPassword: '', active: true });
      loadTechnicians();
    } catch (e) {
      setFormError('Erro ao salvar técnico');
    }
    setSaving(false);
  };

  const handleToggleActive = async (tech: Tecnico) => {
    const newStatus = !tech.active;
    await unifiedDataService.saveTecnico({
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      cpf: tech.cpf,
      active: newStatus,
    });
    loadTechnicians();
  };

  const handleDelete = async (id: string) => {
    await unifiedDataService.deleteTecnico(id);
    setDeleteConfirm(null);
    loadTechnicians();
  };

  const openEditModal = (tech: Tecnico) => {
    setEditingTech(tech);
    setShowPassword(false);
    setFormData({
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      cpf: tech.cpf,
      password: '',
      confirmPassword: '',
      active: tech.active,
    });
    setShowModal(true);
  };

  const openNewModal = () => {
    setEditingTech(null);
    setShowPassword(true);
    setFormData({ name: '', email: '', phone: '', cpf: '', password: '', confirmPassword: '', active: true });
    setShowModal(true);
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Email: ${successData.email}\nSenha: ${successData.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-500" />
            Técnicos
          </h1>
          <p className="text-muted-foreground">Gerencie técnicos e instaladores</p>
        </div>
        <Button onClick={openNewModal} className="bg-purple-500 hover:bg-purple-600">
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Técnico
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar técnico..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTechnicians.map((tech, i) => (
                <motion.div
                  key={tech.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    !tech.active ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Wrench className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{tech.name}</p>
                      {!tech.active && (
                        <Badge variant="outline" className="text-xs">Inativo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {tech.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {tech.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleToggleActive(tech)}
                      title={tech.active ? 'Desativar técnico' : 'Ativar técnico'}
                    >
                      {tech.active ? (
                        <EyeOff className="w-4 h-4 text-green-600" />
                      ) : (
                        <Eye className="w-4 h-4 text-red-500" />
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(tech)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirm(tech.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {filteredTechnicians.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum técnico encontrado</p>
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
              {editingTech ? 'Editar Técnico' : 'Novo Técnico'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome completo</label>
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
              <label className="text-sm font-medium">Email (login)</label>
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
                {editingTech ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingTech ? 'Digite nova senha para alterar' : 'Mínimo 6 caracteres'}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!editingTech && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar senha</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirme a senha"
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CPF</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                  placeholder="000.000.000-00"
                  className="pl-10"
                  maxLength={14}
                />
              </div>
            </div>

            {editingTech && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm font-medium">Técnico ativo</label>
              </div>
            )}

            {formError && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {formError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              {editingTech ? 'Salvar' : 'Cadastrar Técnico'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Técnico cadastrado com sucesso!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">O técnico já pode fazer login com as credenciais abaixo:</p>
            
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{successData.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Senha:</span>
                <span className="font-medium">{successData.password}</span>
              </div>
            </div>

            <Button variant="outline" onClick={copyCredentials} className="w-full">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copiado!' : 'Copiar credenciais'}
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)}>
              Fechar
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
            Tem certeza que deseja excluir este técnico? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
