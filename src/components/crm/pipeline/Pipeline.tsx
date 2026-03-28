import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, MoreHorizontal, Phone, Mail, 
  MessageSquare, User, DollarSign, Calendar, ChevronRight,
  GripVertical, X, Check, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCRMStore } from '@/stores/crmStore';
import { Lead, STATUS_LABELS, SOURCE_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/types/crm';

export default function Pipeline() {
  const { leads, pipelines, users, addLead, updateLead } = useCRMStore();
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const pipeline = pipelines[0];

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search)
    );
  }, [leads, search]);

  const leadsByStage = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    pipeline.stages.forEach(stage => {
      grouped[stage.id] = filteredLeads.filter(lead => lead.stageId === stage.id);
    });
    return grouped;
  }, [filteredLeads, pipeline.stages]);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stageId !== stageId) {
      updateLead(draggedLead.id, { stageId });
    }
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleAddLead = () => {
    setSelectedLead(null);
    setShowLeadModal(true);
  };

  const handleSaveLead = (leadData: Partial<Lead>) => {
    if (selectedLead) {
      updateLead(selectedLead.id, leadData);
    } else {
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        name: leadData.name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        company: leadData.company,
        status: 'novo',
        source: 'website',
        priority: 'media',
        tags: [],
        value: 0,
        pipelineId: pipeline.id,
        stageId: pipeline.stages[0].id,
        notes: [],
        tasks: [],
        activities: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addLead(newLead);
    }
    setShowLeadModal(false);
  };

  const totalValue = filteredLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  return (
    <div className="h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">{pipeline.name}</h1>
          <p className="text-gray-500">
            {filteredLeads.length} leads • Valor total: R$ {totalValue.toLocaleString('pt-BR')}
          </p>
        </div>
        <Button onClick={handleAddLead} className="bg-gradient-brand">
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
          {pipeline.stages.map((stage) => (
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
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stage.color }}
                    />
                    <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                  </div>
                  <Badge variant="secondary">{leadsByStage[stage.id]?.length || 0}</Badge>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {stage.probability}% probabilidade
                </div>
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
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowLeadModal(true);
                      }}
                      className={`
                        bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer
                        hover:shadow-md hover:border-primary/30 transition-all
                        ${draggedLead?.id === lead.id ? 'opacity-50' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                            {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                            <p className="text-xs text-gray-500">{lead.company || lead.email}</p>
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
                        <span className="text-xs text-gray-400">
                          {formatDate(lead.updatedAt)}
                        </span>
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
        users={users}
        onSave={handleSaveLead}
      />
    </div>
  );
}

function LeadModal({ 
  open, 
  onClose, 
  lead, 
  users, 
  onSave 
}: { 
  open: boolean; 
  onClose: () => void; 
  lead: Lead | null;
  users: { id: string; name: string }[];
  onSave: (data: Partial<Lead>) => void;
}) {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    company: lead?.company || '',
    value: lead?.value || 0,
    priority: lead?.priority || 'media' as Lead['priority'],
    newNote: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nome</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Telefone</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Empresa</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Nome da empresa"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Valor (R$)</label>
              <Input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Lead['priority'] })}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observações sobre o lead..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-brand">
              {lead ? 'Salvar' : 'Criar Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoje';
  if (days === 1) return '1 dia';
  if (days < 7) return `${days} dias`;
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}
