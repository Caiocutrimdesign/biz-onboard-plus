import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Users, DollarSign, TrendingUp, 
  Plus, Send, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SuperLayout from '@/components/layout/SuperLayout';

export default function SHELLPage() {
  const [leads] = useState<any[]>([]);

  const stats = {
    totalLeads: leads.length,
    converted: leads.filter(l => l.status === 'converted').length,
    pending: leads.filter(l => l.status === 'pending').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };

  return (
    <SuperLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-7 h-7 text-pink-500" />
              SHELL - Vendas
            </h1>
            <p className="text-muted-foreground">Captura e conversão de leads</p>
          </div>
          <Button className="bg-pink-500 hover:bg-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-pink-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalLeads}</p>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.converted}</p>
                  <p className="text-sm text-muted-foreground">Convertidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Aguardando</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(stats.totalLeads > 0 ? (stats.converted / stats.totalLeads) * 100 : 0)}%</p>
                  <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">
            <CardContent className="pt-6">
              <Plus className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Novo Lead</h3>
              <p className="text-white/80 mb-4">Capture um novo lead de venda</p>
              <Button className="bg-white text-pink-600 hover:bg-white/90">
                Começar
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
            <CardContent className="pt-6">
              <Send className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Disparo em Massa</h3>
              <p className="text-white/80 mb-4">Envie mensagens para vários leads</p>
              <Button className="bg-white text-purple-600 hover:bg-white/90">
                Disparar
              </Button>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <CardContent className="pt-6">
              <TrendingUp className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Relatórios</h3>
              <p className="text-white/80 mb-4">Veja métricas de vendas</p>
              <Button className="bg-white text-blue-600 hover:bg-white/90">
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Leads List */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {leads.length > 0 ? (
              <div className="space-y-3">
                {leads.map((lead: any, i: number) => (
                  <motion.div
                    key={lead.id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.email}</p>
                    </div>
                    <Badge className={`
                      ${lead.status === 'converted' ? 'bg-green-100 text-green-800' : ''}
                      ${lead.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${lead.status === 'lost' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {lead.status === 'converted' ? 'Convertido' : 
                       lead.status === 'pending' ? 'Aguardando' : 'Perdido'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum lead registrado ainda</p>
                <Button className="mt-4 bg-pink-500 hover:bg-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Lead
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperLayout>
  );
}
