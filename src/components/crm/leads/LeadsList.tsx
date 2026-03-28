import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, MoreHorizontal, Phone, Mail, MessageSquare, Eye, Edit2, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLeads, usePipeline, useUsers } from '@/hooks/useCRM';
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/supabase';
import type { DBLead } from '@/lib/supabase';

export default function LeadsList() {
  const { leads, loading, updateLead, deleteLead, refetch } = useLeads();
  const { stages } = usePipeline();
  const { users } = useUsers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<DBLead | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchSearch = !search || 
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        (lead.email?.toLowerCase().includes(search.toLowerCase())) ||
        lead.phone.includes(search) ||
        (lead.company?.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || lead.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500">{filteredLeads.length} leads encontrados</p>
        </div>
        <Button onClick={() => { setSelectedLead(null); setShowDetailModal(true); }} className="bg-gradient-brand">
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Buscar por nome, e-mail, telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-xl" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-11 px-4 rounded-xl border border-gray-300">
          <option value="all">Todos os Status</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {filteredLeads.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Lead</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Prioridade</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Última Atualização</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLeads.map((lead, index) => (
                  <motion.tr key={lead.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => { setSelectedLead(lead); setShowDetailModal(true); }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                          {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-500">{lead.email || lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(lead.status)} text-white border-none`}>{STATUS_LABELS[lead.status]}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${PRIORITY_COLORS[lead.priority]}`}>{PRIORITY_LABELS[lead.priority]}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {lead.value && lead.value > 0 ? (
                        <span className="font-semibold text-green-600">R$ {lead.value.toLocaleString('pt-BR')}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><span className="text-sm text-gray-500">{formatDate(lead.updated_at)}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-500 transition-colors" onClick={() => { setSelectedLead(lead); setShowDetailModal(true); }}>
                          <Eye className="h-4 w-4" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit2 className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                            <DropdownMenuItem><Phone className="h-4 w-4 mr-2" />Ligar</DropdownMenuItem>
                            <DropdownMenuItem><Mail className="h-4 w-4 mr-2" />Enviar E-mail</DropdownMenuItem>
                            <DropdownMenuItem><MessageSquare className="h-4 w-4 mr-2" />WhatsApp</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => deleteLead(lead.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Card className="p-12 text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-xl font-bold text-gray-900 mb-2">Nenhum lead encontrado</h3>
          <p className="text-gray-500 mb-6">
            {search || statusFilter !== 'all' ? 'Tente ajustar seus filtros de busca' : 'Comece adicionando seu primeiro lead'}
          </p>
          <Button onClick={() => { setSelectedLead(null); setShowDetailModal(true); }} className="bg-gradient-brand">
            <Plus className="h-4 w-4 mr-2" />Adicionar Lead
          </Button>
        </Card>
      )}

      <LeadDetailModal open={showDetailModal} onClose={() => setShowDetailModal(false)} lead={selectedLead} stages={stages} users={users} />
    </motion.div>
  );
}

function LeadDetailModal({ open, onClose, lead, stages, users }: { open: boolean; onClose: () => void; lead: DBLead | null; stages: any[]; users: any[] }) {
  if (!lead) return null;
  const currentStage = stages.find((s: any) => s.id === lead.stage_id);
  const owner = users.find((u: any) => u.id === lead.owner_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center text-white font-bold text-2xl">
                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <DialogTitle className="font-display text-2xl">{lead.name}</DialogTitle>
                <p className="text-gray-500">{lead.company || lead.email}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(lead.status)} text-white border-none`}>{STATUS_LABELS[lead.status]}</Badge>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">Informações</h4>
              <div className="space-y-3">
                {lead.email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-gray-400" /><span className="text-sm">{lead.email}</span></div>}
                <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-gray-400" /><span className="text-sm">{lead.phone}</span></div>
                {lead.company && <div className="flex items-center gap-3"><User className="h-4 w-4 text-gray-400" /><span className="text-sm">{lead.company}</span></div>}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">Detalhes</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Prioridade</span><Badge className={`${PRIORITY_COLORS[lead.priority]}`}>{PRIORITY_LABELS[lead.priority]}</Badge></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Responsável</span><span className="text-sm font-medium">{owner?.name || 'Não atribuído'}</span></div>
                {lead.value && lead.value > 0 && <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Valor</span><span className="text-sm font-bold text-green-600">R$ {lead.value.toLocaleString('pt-BR')}</span></div>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase">Etapa do Funil</h4>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: currentStage?.color || '#3B82F6' }} />
              <span className="font-medium">{currentStage?.name || 'Novo Lead'}</span>
            </div>
          </div>

          {lead.notes && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase">Notas</h4>
              <div className="p-3 rounded-xl bg-gray-50"><p className="text-sm">{lead.notes}</p></div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1"><Phone className="h-4 w-4 mr-2" />Ligar</Button>
            <Button variant="outline" className="flex-1"><Mail className="h-4 w-4 mr-2" />E-mail</Button>
            <Button className="flex-1 bg-gradient-brand"><MessageSquare className="h-4 w-4 mr-2" />WhatsApp</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = { novo: 'bg-blue-500', contatado: 'bg-purple-500', qualificado: 'bg-indigo-500', proposta: 'bg-yellow-500', negociacao: 'bg-orange-500', ganho: 'bg-green-500', perdido: 'bg-red-500' };
  return colors[status] || 'bg-gray-500';
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
}
