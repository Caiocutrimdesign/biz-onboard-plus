import { motion } from 'framer-motion';
import { Settings, User, Building2, Bell, Lock, Palette, Globe, Database, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SettingsView() {
  const settingsSections = [
    { id: 'profile', label: 'Perfil da Empresa', icon: Building2, description: 'Informações gerais da sua empresa' },
    { id: 'users', label: 'Usuários', icon: User, description: 'Gerencie membros da equipe', badge: '3 usuários' },
    { id: 'notifications', label: 'Notificações', icon: Bell, description: 'Configure alertas e lembretes' },
    { id: 'security', label: 'Segurança', icon: Lock, description: 'Autenticação e permissões' },
    { id: 'appearance', label: 'Aparência', icon: Palette, description: 'Tema e personalização visual' },
    { id: 'integrations', label: 'Integrações', icon: Globe, description: 'Conecte com outras ferramentas' },
    { id: 'data', label: 'Dados', icon: Database, description: 'Importação e exportação' },
    { id: 'billing', label: 'Cobrança', icon: CreditCard, description: 'Planos e pagamentos' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Gerencie as configurações do seu CRM</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Perfil da Empresa</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nome da Empresa</label>
                  <Input defaultValue="Biz CRM Plus" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">CNPJ</label>
                  <Input defaultValue="12.345.678/0001-90" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Endereço</label>
                <Input defaultValue="Av. Paulista, 1000 - São Paulo, SP" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Telefone</label>
                  <Input defaultValue="(11) 99999-9999" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">E-mail</label>
                  <Input defaultValue="contato@bizcrm.com.br" />
                </div>
              </div>
              <Button className="bg-gradient-brand">Salvar Alterações</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Usuários da Equipe</h3>
            <div className="space-y-4">
              {[
                { name: 'Carlos Silva', email: 'carlos@empresa.com', role: 'Administrador' },
                { name: 'Ana Oliveira', email: 'ana@empresa.com', role: 'Gerente' },
                { name: 'Pedro Santos', email: 'pedro@empresa.com', role: 'Usuário' },
              ].map((user) => (
                <div key={user.email} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                Convidar Novo Usuário
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Preferências</h3>
            <div className="space-y-3">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <section.icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{section.label}</p>
                    <p className="text-xs text-gray-500">{section.description}</p>
                  </div>
                  {section.badge && (
                    <Badge variant="secondary">{section.badge}</Badge>
                  )}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Plano Atual</h3>
            <div className="p-4 rounded-xl bg-gradient-brand text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium opacity-80">Plano</span>
                <Badge className="bg-white/20 text-white border-none">Ativo</Badge>
              </div>
              <p className="text-2xl font-bold">Business</p>
              <p className="text-sm opacity-80 mt-1">R$ 297/mês</p>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Alterar Plano
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
