import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Plus, Search, Edit2, Trash2, User,
  CheckCircle, XCircle, Loader2, AlertCircle,
  Wrench, Activity, Settings, Play, Pause
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { tecService } from '@/lib/tecService';
import type { TECAgent } from '@/types/tec';

export default function CRMAgentsPage() {
  const [agents, setAgents] = useState<TECAgent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<TECAgent | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technician_id: '',
    technician_name: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const agentsData = tecService.getTECAgents();
      const techsData = tecService.getTechnicians();
      setAgents(agentsData);
      setTechnicians(techsData);
    } catch (e) {
      console.error('Error loading data:', e);
    }
    setLoading(false);
  };

  const filteredAgents = agents.filter(a => 
    !search || 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.technician_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.name || !formData.description) {
      setFormError('Preencha todos os campos');
      return;
    }

    const tech = technicians.find(t => t.id === formData.technician_id);

    if (editingAgent) {
      tecService.updateTECAgent(editingAgent.id, {
        ...formData,
        technician_name: tech?.name || formData.technician_name,
      });
    } else {
      tecService.saveTECAgent({
        ...formData,
        technician_name: tech?.name || '',
        status: 'ativo',
      });
    }

    setShowModal(false);
    setEditingAgent(null);
    setFormData({ name: '', description: '', technician_id: '', technician_name: '' });
    loadData();
  };

  const handleToggleStatus = (agent: TECAgent) => {
    tecService.updateTECAgent(agent.id, { 
      status: agent.status === 'ativo' ? 'inativo' : 'ativo' 
    });
    loadData();
  };

  const handleDelete = (id: string) => {
    tecService.deleteTECAgent(id);
    setDeleteConfirm(null);
    loadData();
  };

  const openEditModal = (agent: TECAgent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      technician_id: agent.technician_id,
      technician_name: agent.technician_name || '',
    });
    setShowModal(true);
  };

  const stats = {
    total: agents.length,
    ativos: agents.filter(a => a.status === 'ativo').length,
    inativos: agents.filter(a => a.status === 'inativo').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="w-7 h-7 text-violet-500" />
            Agentes - CRM
          </h1>
          <p className="text-muted-foreground">Gerencie agentes criados pelos técnicos</p>
        </div>
        <Button onClick={() => { setEditingAgent(null); setFormData({ name: '', description: '', technician_id: '', technician_name: '' }); setShowModal(true); }} className="bg-violet-500 hover:bg-violet-600">
          <Plus className="w-4 h-4 mr-2" />
          Novo Agente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-white/80">Total Agentes</p>
              </div>
              <Bot className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.ativos}</p>
                <p className="text-white/80">Ativos</p>
              </div>
              <Activity className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{stats.inativos}</p>
                <p className="text-white/80">Inativos</p>
              </div>
              <Pause className="w-10 h-10 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar agente..."
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
              {filteredAgents.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                    agent.status === 'inativo' ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{agent.name}</p>
                      <Badge className={agent.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {agent.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{agent.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Wrench className="w-3 h-3" />
                      <span>Criado por: {agent.technician_name || 'Sistema'}</span>
                      <span>•</span>
                      <span>{new Date(agent.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(agent)}>
                      {agent.status === 'ativo' ? (
                        <Pause className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <Play className="w-4 h-4 text-green-600" />
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEditModal(agent)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirm(agent.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {filteredAgents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum agente encontrado</p>
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
              {editingAgent ? 'Editar Agente' : 'Novo Agente'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Agente</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Agente de Rastreamento"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva a função do agente"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Técnico Responsável</label>
              <select
                value={formData.technician_id}
                onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Selecione um técnico</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

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
              {editingAgent ? 'Salvar' : 'Criar'}
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
            Tem certeza que deseja excluir este agente?
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
