import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, ShoppingCart, Star, Smile, Users, Package, DollarSign, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import SuperLayout from '@/components/layout/SuperLayout';
import StepSatisfaction from '@/components/registration/StepSatisfaction';

type Tab = 'tec' | 'erp' | 'shell' | 'satisfaction';

export default function TECPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('tec');

  const tabs = [
    { id: 'tec' as Tab, label: 'TEC', icon: Wrench, color: 'orange', description: 'Servicos Tecnicos' },
    { id: 'erp' as Tab, label: 'ERP', icon: Package, color: 'blue', description: 'Gestao Empresarial' },
    { id: 'shell' as Tab, label: 'SHELL', icon: ShoppingCart, color: 'green', description: 'Vendas e Pedidos' },
    { id: 'satisfaction' as Tab, label: 'Satisfacao', icon: Smile, color: 'purple', description: 'Avaliacao de Clientes' },
  ];

  const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', hover: 'hover:bg-orange-600' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', hover: 'hover:bg-blue-600' },
    green: { bg: 'bg-green-500', text: 'text-green-500', hover: 'hover:bg-green-600' },
    purple: { bg: 'bg-purple-500', text: 'text-purple-500', hover: 'hover:bg-purple-600' },
  };

  return (
    <SuperLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="w-7 h-7 text-orange-500" />
              Central de Operacoes
            </h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.name}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const colors = colorClasses[tab.color];
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all whitespace-nowrap ${
                  isActive 
                    ? `${colors.bg} text-white shadow-lg` 
                    : 'bg-card hover:bg-muted border'
                }`}
              >
                <Icon className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-bold">{tab.label}</p>
                  <p className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'tec' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-500" />
                  TEC - Servicos Tecnicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Wrench className="w-7 h-7 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-orange-600">12</p>
                          <p className="text-sm text-muted-foreground">Servicos Pendentes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Users className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-blue-600">8</p>
                          <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-green-600">R$ 2.450</p>
                          <p className="text-sm text-muted-foreground">Faturamento do Mes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-8 text-center py-12 border-2 border-dashed rounded-xl">
                  <Wrench className="w-16 h-16 mx-auto mb-4 text-orange-300" />
                  <p className="text-lg font-medium text-muted-foreground">Modulo TEC em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground mt-2">Gerencie instalacoes e manutencoes de dispositivos</p>
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                    Novo Servico
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'erp' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  ERP - Gestao Empresarial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-purple-200 bg-purple-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Package className="w-7 h-7 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-purple-600">156</p>
                          <p className="text-sm text-muted-foreground">Produtos Cadastrados</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-amber-200 bg-amber-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-7 h-7 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-amber-600">R$ 45.890</p>
                          <p className="text-sm text-muted-foreground">Estoque Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
                          <ShoppingCart className="w-7 h-7 text-red-600" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-red-600">23</p>
                          <p className="text-sm text-muted-foreground">Pedidos do Mes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-8 text-center py-12 border-2 border-dashed rounded-xl">
                  <Package className="w-16 h-16 mx-auto mb-4 text-blue-300" />
                  <p className="text-lg font-medium text-muted-foreground">Modulo ERP em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground mt-2">Controle de estoque, financas e gestao empresarial</p>
                  <Button className="mt-4 bg-blue-500 hover:bg-blue-600">
                    Acessar ERP
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'shell' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-500" />
                  SHELL - Vendas e Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                          <ShoppingCart className="w-7 h-7 text-green-600" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-green-600">47</p>
                          <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-7 h-7 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-blue-600">R$ 8.750</p>
                          <p className="text-sm text-muted-foreground">Vendas do Dia</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200 bg-purple-50/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Star className="w-7 h-7 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-3xl font-bold text-purple-600">4.8</p>
                          <p className="text-sm text-muted-foreground">Avaliacao Media</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-8 text-center py-12 border-2 border-dashed rounded-xl">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-green-300" />
                  <p className="text-lg font-medium text-muted-foreground">Modulo SHELL em desenvolvimento</p>
                  <p className="text-sm text-muted-foreground mt-2">Gerencie vendas, pedidos e comissoes</p>
                  <Button className="mt-4 bg-green-500 hover:bg-green-600">
                    Novo Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'satisfaction' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-purple-500" />
                  Satisfacao do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StepSatisfaction />
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </SuperLayout>
  );
}
