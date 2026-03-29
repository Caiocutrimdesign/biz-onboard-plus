import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, GraduationCap, Play, ChevronRight, ChevronDown,
  MapPin, Shield, Bell, Key, Smartphone, Car, Users,
  BarChart3, Globe, Clock, CheckCircle2, Search, Lightbulb,
  FileText, Video, MessageCircle, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Guide {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  description: string;
  difficulty: 'basico' | 'intermediario' | 'avancado';
  duration: string;
  steps?: { title: string; content: string }[];
  tips?: string[];
}

interface LearningCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  guides: Guide[];
}

const learningCategories: LearningCategory[] = [
  {
    id: 'rastreamento',
    name: 'Rastreamento',
    icon: MapPin,
    color: 'text-blue-500 bg-blue-500/10',
    guides: [
      {
        id: 'como-rastrear',
        title: 'Como Rastrear seu Veículo',
        category: 'rastreamento',
        icon: MapPin,
        description: 'Aprenda a acompanhar a localização do seu veículo em tempo real pelo aplicativo.',
        difficulty: 'basico',
        duration: '3 min',
        steps: [
          { title: 'Abra o Aplicativo', content: 'Faça login no app Rastremix usando seu CPF e senha.' },
          { title: 'Selecione o Veículo', content: 'Na tela inicial, toque no veículo que deseja rastrear.' },
          { title: 'Visualize no Mapa', content: 'O mapa mostrará a posição atual do seu veículo em tempo real.' },
          { title: 'Recursos Extras', content: 'Use os botões de zoom e funcionalidades para ver detalhes.' },
        ],
        tips: [
          'Mantenha o app atualizado para melhor performance',
          'Permita notificações para alertas em tempo real',
          'Use Wi-Fi quando disponível para economizar dados',
        ],
      },
      {
        id: 'historico-rotas',
        title: 'Histórico de Rotas',
        category: 'rastreamento',
        icon: Globe,
        description: 'Descubra como ver onde seu veículo esteve nos últimos dias.',
        difficulty: 'intermediario',
        duration: '5 min',
        steps: [
          { title: 'Acesse Histórico', content: 'No menu do veículo, toque em "Histórico de Rotas".' },
          { title: 'Selecione o Período', content: 'Escolha a data inicial e final que deseja consultar.' },
          { title: 'Veja o Trajeto', content: 'O mapa mostrará todas as rotas percorridas no período.' },
          { title: 'Exporte Relatórios', content: 'Toque em "Exportar" para gerar um PDF com o relatório.' },
        ],
        tips: [
          'O histórico é mantido por até 90 dias',
          'Você pode filtrar por velocidade máxima atingida',
          'Relatórios são úteis para prestação de contas',
        ],
      },
    ],
  },
  {
    id: 'seguranca',
    name: 'Segurança',
    icon: Shield,
    color: 'text-emerald-500 bg-emerald-500/10',
    guides: [
      {
        id: 'alertas-movimento',
        title: 'Configurar Alertas de Movimento',
        category: 'seguranca',
        icon: Bell,
        description: 'Receba notificações sempre que seu veículo se mover.',
        difficulty: 'basico',
        duration: '4 min',
        steps: [
          { title: 'Abra Configurações', content: 'No app, vá em "Configurações" > "Alertas".' },
          { title: 'Ative os Alertas', content: 'Ligue o toggle "Alerta de Movimento".' },
          { title: 'Escolha o Horário', content: 'Defina em quais horários quer receber os alertas.' },
          { title: 'Configure Sensibilidade', content: 'Ajuste a sensibilidade do sensor de movimento.' },
        ],
        tips: [
          'Configure alertas diferentes para dia e noite',
          'Adicione e-mails alternativos para receber cópias',
          'Teste os alertas após configurar',
        ],
      },
      {
        id: 'bloqueio-remoto',
        title: 'Bloqueio Remoto do Motor',
        category: 'seguranca',
        icon: Key,
        description: 'Aprenda a bloquear o motor do veículo à distância em caso de emergência.',
        difficulty: 'avancado',
        duration: '6 min',
        steps: [
          { title: 'Verifique Condições', content: 'O veículo deve estar com velocidade inferior a 30 km/h.' },
          { title: 'Acesse o Painel de Emergência', content: 'No app, toque no ícone de escudo "Bloqueio de Emergência".' },
          { title: 'Confirme a Ação', content: 'Leia o aviso e confirme que deseja bloquear o veículo.' },
          { title: 'Aguarde o Bloqueio', content: 'O motor será cortado em até 30 segundos.' },
        ],
        tips: [
          'Use apenas em casos de emergência ou roubo',
          'O desbloqueio é igualmente rápido',
          'Nosso SOC 24h pode fazer o bloqueio por você',
        ],
      },
    ],
  },
  {
    id: 'aplicativo',
    name: 'Aplicativo',
    icon: Smartphone,
    color: 'text-purple-500 bg-purple-500/10',
    guides: [
      {
        id: 'primeiros-passos',
        title: 'Primeiros Passos no App',
        category: 'aplicativo',
        icon: Play,
        description: 'Tutorial completo para novos usuários da Rastremix.',
        difficulty: 'basico',
        duration: '5 min',
        steps: [
          { title: 'Baixe o App', content: 'Disponível na App Store (iOS) e Google Play (Android).' },
          { title: 'Crie sua Conta', content: 'Use o CPF do titular e o e-mail cadastrados.' },
          { title: 'Adicione seu Veículo', content: 'Escaneie o QR Code do equipamento ou digite o código.' },
          { title: 'Explore os Recursos', content: 'Conozca todas as funcionalidades disponíveis.' },
        ],
        tips: [
          'Permita notificações push para não perder alertas',
          'Cadastre um e-mail alternativo para segurança',
          'Ative a biometria para login mais rápido',
        ],
      },
      {
        id: 'notificacoes',
        title: 'Personalizar Notificações',
        category: 'aplicativo',
        icon: Bell,
        description: 'Escolha exatamente quais alertas deseja receber e como.',
        difficulty: 'basico',
        duration: '3 min',
        steps: [
          { title: 'Abra Notificações', content: 'Vá em "Configurações" > "Notificações".' },
          { title: 'Selecione os Tipos', content: 'Marque quais eventos devem gerar notificações.' },
          { title: 'Escolha o Canal', content: 'Decida entre push, SMS, e-mail ou todos.' },
          { title: 'Defina Horários', content: 'Configure um período de silêncio se necessário.' },
        ],
        tips: [
          'Evite marcar tudo para não ser bombardeado',
          'Priorize alertas críticos como movimento e velocidade',
          'SMS são ideais para quando não tem internet',
        ],
      },
    ],
  },
  {
    id: 'gestao',
    name: 'Gestão',
    icon: Users,
    color: 'text-amber-500 bg-amber-500/10',
    guides: [
      {
        id: 'adicionar-usuarios',
        title: 'Adicionar Usuários ao Sistema',
        category: 'gestao',
        icon: Users,
        description: 'Permita que familiares ou funcionários também rastreiem o veículo.',
        difficulty: 'intermediario',
        duration: '4 min',
        steps: [
          { title: 'Acesse Gerenciar Usuários', content: 'No menu do veículo, toque em "Usuários".' },
          { title: 'Clique em Adicionar', content: 'Toque no botão "+" para adicionar um novo usuário.' },
          { title: 'Informe os Dados', content: 'Digite nome, CPF e e-mail do novo usuário.' },
          { title: 'Defina Permissões', content: 'Escolha se pode rastrear, bloquear ou apenas visualizar.' },
        ],
        tips: [
          'Cada veículo pode ter até 5 usuários vinculados',
          'O titular é sempre o administrador principal',
          'Usuários recebem um e-mail para criar senha',
        ],
      },
      {
        id: 'relatorios',
        title: 'Gerar Relatórios Detalhados',
        category: 'gestao',
        icon: BarChart3,
        description: 'Crie relatórios profissionais sobre uso e localização do veículo.',
        difficulty: 'intermediario',
        duration: '5 min',
        steps: [
          { title: 'Acesse Relatórios', content: 'No menu, toque em "Relatórios" > "Novo Relatório".' },
          { title: 'Selecione o Veículo', content: 'Escolha qual veículo (ou veículos) incluir.' },
          { title: 'Defina o Período', content: 'Selecione as datas de início e fim.' },
          { title: 'Escolha o Modelo', content: 'Selecione entre padrões ou crie um personalizado.' },
        ],
        tips: [
          'Relatórios em PDF são ideais para empresas',
          'Você pode agendar relatórios automáticos mensais',
          'Dados são exportados em formato editável',
        ],
      },
    ],
  },
];

const quickTips = [
  { icon: MapPin, tip: 'O rastreamento funciona em todo o Brasil com cobertura nacional' },
  { icon: Bell, tip: 'Configure alertas para dormir tranquilo(a)' },
  { icon: Shield, tip: 'O bloqueio remoto é a melhor defesa contra roubos' },
  { icon: Smartphone, tip: 'O app funciona offline - basta abrir para ver a última posição' },
  { icon: Users, tip: 'Adicione até 5 usuários por veículo' },
  { icon: Clock, tip: 'O histórico de rotas fica disponível por até 90 dias' },
];

function GuideCard({ guide, onClick }: { guide: Guide; onClick: () => void }) {
  const difficultyColors = {
    basico: 'bg-green-500/10 text-green-600 border-green-500/20',
    intermediario: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    avancado: 'bg-red-500/10 text-red-600 border-red-500/20',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full border-border/50 hover:border-primary/50 transition-colors">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <guide.icon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold mb-1">{guide.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{guide.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <Badge className={difficultyColors[guide.difficulty]}>
                  {guide.difficulty === 'basico' ? 'Básico' : guide.difficulty === 'intermediario' ? 'Intermediário' : 'Avançado'}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {guide.duration}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function GuideModal({ guide, onClose }: { guide: Guide | null; onClose: () => void }) {
  if (!guide) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <guide.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black">{guide.title}</h2>
                <p className="text-muted-foreground">{guide.description}</p>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {guide.steps && (
              <div className="space-y-4 mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  Passo a Passo
                </h3>
                {guide.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 pb-4 border-b border-border last:border-0">
                      <h4 className="font-semibold mb-1">{step.title}</h4>
                      <p className="text-muted-foreground">{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {guide.tips && (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <h3 className="font-bold text-lg flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Dicas Importantes
                </h3>
                <ul className="space-y-2">
                  {guide.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border flex justify-end">
            <Button onClick={onClose} className="rounded-xl">
              Fechar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function LearningPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('rastreamento');

  const filteredCategories = learningCategories.map((cat) => ({
    ...cat,
    guides: cat.guides.filter(
      (g) =>
        (!selectedCategory || g.category === selectedCategory) &&
        (!search ||
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.description.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter((cat) => cat.guides.length > 0);

  return (
    <div className="space-y-8">
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <GraduationCap className="w-5 h-5" />
            </motion.div>
            <span className="text-white/60 text-sm font-medium">Centro de Aprendizado</span>
          </div>
          <h1 className="font-display text-4xl font-black mb-2">
            Aprenda a Usar a Rastremix
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Guias práticos e tutoriais para você aproveitar ao máximo todos os recursos do sistema.
          </p>

          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <Input
                placeholder="Buscar guias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 pl-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="font-bold text-lg mb-3">Categorias</h3>
          {filteredCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                expandedCategory === cat.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.guides.length} guias</p>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === cat.id ? 'rotate-180' : ''}`} />
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          {filteredCategories
            .filter((cat) => !expandedCategory || cat.id === expandedCategory)
            .map((cat) => (
              <div key={cat.id}>
                <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  {cat.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cat.guides.map((guide) => (
                    <GuideCard
                      key={guide.id}
                      guide={guide}
                      onClick={() => setSelectedGuide(guide)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-primary/5 to-primary/10 p-8 border border-primary/10"
      >
        <h2 className="font-display text-2xl font-black mb-6 flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-primary" />
          Dicas Rápidas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickTips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border/50"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <tip.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm">{tip.tip}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <GuideModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />
    </div>
  );
}
