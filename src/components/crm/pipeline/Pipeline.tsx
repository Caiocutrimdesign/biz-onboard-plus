import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, GripVertical, DollarSign, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLeads, usePipeline, useTags, useUsers } from '@/hooks/useCRM';
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/supabase';
import type { DBLead } from '@/lib/supabase';

const defaultStages = [
  { id: 'stage-1', name: 'Novo Lead', color: '#3B82F6', order_index: 0, probability: 10 },
  { id: 'stage-2', name: 'Contatado', color: '#8B5CF6', order_index: 1, probability: 20 },
  { id: 'stage-3', name: 'Qualificado', color: '#06B6D4', order_index: 2, probability: 40 },
  { id: 'stage-4', name: 'Proposta', color: '#F59E0B', order_index: 3, probability: 60 },
  { id: 'stage-5', name: 'Negociação', color: '#F97316', order_index: 4, probability: 80 },
  { id: 'stage-6', name: 'Ganho', color: '#22C55E', order_index: 5, probability: 100, is_final: true },
  { id: 'stage-7', name: 'Perdido', color: '#EF4444', order_index: 6, probability: 0, is_final: true },
];

export default function Pipeline() {
  const { leads, loading, addLead, updateLead, refetch } = useLeads();
  const { stages } = usePipeline();
  const { users } = useUsers();
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<DBLead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [draggedLead, setDraggedLead] = useState<DBLead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const pipelineStages = stages.length > 0 ? stages : defaultStages;

  const filteredLeads = useMemo(() => {
    if (!search) return leads;
    return leads.filter(lead => 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.email?.toLowerCase().includes(search.toLowerCase())) ||
      lead.phone.includes(search)
    );
  }, [leads, search]);

  const leadsByStage = useMemo(() => {
    const grouped: Record<string, DBLead[]> = {};
    pipelineStages.forEach((stage: any) => {
      grouped[stage.id] = filteredLeads.filter(lead => lead.stage_id === stage.id);
    });
    return grouped;
  }, [filteredLeads, pipelineStages]);

  const handleDragStart = (e: React.DragEvent, lead: DBLead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => setDragOverStage(null);

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stage_id !== stageId) {
      await updateLead(draggedLead.id, { stage_id: stageId });
    }
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleSaveLead = async (leadData: Partial<DBLead>) => {
    if (selectedLead) {
      await updateLead(selectedLead.id, leadData);
    } else {
      await addLead({
        name: leadData.name || '',
        email: leadData.email || null,
        phone: leadData.phone || '',
        company: leadData.company || null,
        document: null,
        address: null,
        city: null,
        state: null,
        status: 'novo',
        source: 'website',
        priority: 'media',
        value: 0,
        tags: [],
        notes: leadData.notes || '',
        owner_id: null,
        pipeline_id: 'default',
        stage_id: 'stage-1',
      });
    }
    setShowLeadModal(false);
    refetch();
  };

  const totalValue = filteredLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Pipeline de Vendas</h1>
          <p className="text-gray-500">
            {filteredLeads.length} leads • Valor total: R$ {totalValue.toLocaleString('pt-BR')}
          </p>
        </div>
        <Button onClick={() => { setSelectedLead(null); setShowLeadModal(true); }} className="bg-gradient-brand">
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </motion.div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max pb-4">
          {pipelineStages.map((stage: any) => (
            <motion.div
              key={stage.id}
              className={`w-80 flex-shrink-0 flex flex-col bg-gray-100 rounded-2xl transition-all ${
                dragOverStage === stage.id ? 'ring-2 ring-primary ring-opacity-50' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                  </div>
                  <Badge variant="secondary">{leadsByStage[stage.id]?.length || 0}</Badge>
                </div>
                <div className="mt-1 text-xs text-gray-500">{stage.probability}% probabilidade</div>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                <AnimatePresence>
                  {leadsByStage[stage.id]?.map((lead, index) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lead)}
                      onDragEnd={handleDragEnd}
                      onClick={() => { setSelectedLead(lead); setShowLeadModal(true); }}
                      className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all ${
                        draggedLead?.id === lead.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                            {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                            <p className="text-xs text-gray-500">{lead.company || lead.email || lead.phone}</p>
                          </div>
                        </div>
                        <GripVertical className="h-4 w-4 text-gray-300" />
                      </div>

                      {lead.value && lead.value > 0 && (
                        <div className="flex items-center gap-1 text-sm font-semibold text-green-600 mb-3">
                          <DollarSign className="h-4 w-4" />
                          {lead.value.toLocaleString('pt-BR')}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Badge className={`${PRIORITY_COLORS[lead.priority]} text-xs`}>
                          {PRIORITY_LABELS[lead.priority]}
                        </Badge>
                        <span className="text-xs text-gray-400">{formatDate(lead.updated_at)}</span>
                      </div>

                      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-purple-500 transition-colors">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-500 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {leadsByStage[stage.id]?.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    Arraste leads para cá
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <LeadModal
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        lead={selectedLead}
        onSave={handleSaveLead}
      />
    </div>
  );
}

function LeadModal({ open, onClose, lead, onSave }: { open: boolean; onClose: () => void; lead: DBLead | null; onSave: (data: Partial<DBLead>) => void }) {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    value: lead?.value || 0,
    priority: lead?.priority || 'media',
    notes: lead?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {lead ? 'Editar Lead' : 'Novo Lead'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nome *</label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nome completo" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Telefone *</label>
              <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(11) 99999-9999" required />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Empresa</label>
              <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Nome da empresa" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Valor (R$)</label>
              <Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} placeholder="0,00" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Prioridade</label>
              <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} className="w-full h-10 px-3 rounded-xl border border-gray-300">
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notas</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Observações..." rows={3} className="w-full px-3 py-2 rounded-xl border border-gray-300 resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1 bg-gradient-brand">{lead ? 'Salvar' : 'Criar Lead'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hoje';
  if (days === 1) return '1 dia';
  if (days < 7) return `${days} dias`;
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}
