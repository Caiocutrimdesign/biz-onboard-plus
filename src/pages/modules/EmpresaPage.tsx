import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Play, CheckCircle, Heart, Shield, 
  MapPin, Zap, Users, Eye, Car, Phone, Clock, Star, Award,
  Target, Lock, Camera, Package, Truck, Battery, Signal,
  AlertCircle, Check, X, Menu, Globe, BatteryCharging, Navigation,
  Wrench, Brain, Rocket, Globe2, Sparkles, Crown, ShieldCheck,
  Handshake, HeartHandshake, Cpu, Wifi, Fingerprint, EyeOff,
  TrendingUp, Building2, Users2, ShieldAlert, ShieldPlus,
  Radar, Compass, Layers, Hexagon, CircleDot, Radio, Siren
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Logo imports
const logos = {
  'gps-my': '/ABA DA EMPRESA/IMAGENS/Gps my.png',
  'gps-love': '/ABA DA EMPRESA/IMAGENS/gps love logo.png',
  'rastremix': '/ABA DA EMPRESA/IMAGENS/RASTREMIX 1.png',
  'telensat': '/ABA DA EMPRESA/IMAGENS/tel logo.png',
  'topy-pro': '/ABA DA EMPRESA/IMAGENS/LOGO TOPY PRO.webp',
  'valeteck': '/ABA DA EMPRESA/IMAGENS/Valeteck Preto.png',
  'facilit': '/ABA DA EMPRESA/IMAGENS/lOGO FACILIT CORP.png',
};

// Company comprehensive data
const companies = [
  {
    id: 'facilit',
    name: 'FACILIT CORP',
    tagline: 'O Grupo Que Move o Brasil.',
    color: '#FFD700',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    logo: logos['facilit'],
    icon: Building2,
    heroImage: '/ABA DA EMPRESA/IMAGENS/RASTREMIX 1.png',
    whoAreWe: `A Facilit Corp não é apenas uma empresa; somos um ecossistema de proteção que nasceu das ruas do Brasil. Somos feitos de pessoas que entendem a dor de quem trabalha duro e merece o melhor.

Somos uma multinacional brasileira que reúne as mais avançadas tecnologias de rastreamento e segurança para proteger o patrimônio de milhares de famílias e empresas. Nossa missão é democratizar a segurança de alto nível.`,
    whyExist: `Existimos para transformar a insegurança em oportunidade. Para que cada brasileiro possa dormir tranquilo sabendo que tem uma gigante protegendo o que ele construiu com tanto suor.

Nosso propósito é claro: proteger o patrimônio nacional com tecnologia de ponta e coração de brasileiro.`,
    howWeSolve: [
      { icon: Shield, title: 'Tecnologia Multinacional', desc: 'Satélites e IOT de última geração' },
      { icon: Users, title: 'Equipe Especializada', desc: 'Mais de 500 profissionais dedicados' },
      { icon: Zap, title: 'Resposta Imediata', desc: 'Central 24h com tempo de resposta < 2min' },
      { icon: Globe, title: 'Cobertura Nacional', desc: '100% do território brasileiro' },
      { icon: Award, title: 'Certificações', desc: 'ISO 27001 e padrões internacionais' },
      { icon: Heart, title: 'Cuidado Humano', desc: 'Atendimento humanizado 24/7' },
    ],
    stats: [
      { value: '50K+', label: 'Clientes Protegidos' },
      { value: '98.7%', label: 'Taxa de Recuperação' },
      { value: '24/7', label: 'Central de Monitoramento' },
      { value: '500+', label: 'Profissionais' },
    ],
  },
  {
    id: 'gps-my',
    name: 'GPS MY',
    tagline: 'O Rastreador Que É Seu.',
    color: '#22C55E',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    logo: logos['gps-my'],
    icon: Shield,
    heroImage: '/ABA DA EMPRESA/IMAGENS/Gps my.png',
    whoAreWe: `A GPS MY não nasceu em escritórios de vidro; nascemos no asfalto quente, sentindo o cheiro do óleo e o peso da mochila que nunca fica leve.

Somos uma multinacional que fala a língua de quem sabe que, no Brasil, nada vem de gratuita. Para nós, você não é um 'cliente', você é um sobrevivente.`,
    whyExist: `Existimos porque estamos cansados de ver o trabalhador ser enganado. Sabemos a dor de comprar algo com tanto sacrifício e receber uma caixa vazia.

Nossa missão é acabar com a era dos aluguéis eternos, onde você paga a vida toda e nunca é dono de nada.`,
    howWeSolve: [
      { icon: Crown, title: 'Propriedade Definitiva', desc: 'Você é dono do equipamento' },
      { icon: Signal, title: 'Chip Multioperadora', desc: 'Sinal em qualquer lugar' },
      { icon: Lock, title: 'Bloqueio Remoto', desc: 'Controle na palma da mão' },
      { icon: EyeOff, title: 'Anti-Furto Automático', desc: 'Proteção que nunca dorme' },
      { icon: MapPin, title: 'Rastreamento GPS', desc: 'Localização precisa' },
      { icon: Zap, title: 'Instalação Estratégica', desc: 'Escondido do crime' },
    ],
    stats: [
      { value: '100%', label: 'Propriedade' },
      { value: '0', label: 'Mensalidades' },
      { value: '<30s', label: 'Tempo de Bloqueio' },
      { value: '∞', label: 'Sem Limites' },
    ],
    stories: [
      { 
        title: 'O Fim da Frustração', 
        subtitle: 'A Vitória do Dinheiro Suado',
        pain: 'Você comprou um rastreador barato que não funciona. O chip não pegava, o suporte sumiu.',
        solution: 'Com a GPS MY, a tecnologia conecta no primeiro segundo. Chip multioperadora busca sinal em qualquer lugar.',
        result: 'Você vê o ponto brilhando no mapa e o sorriso volta ao rosto. A paz conquistada.'
      },
      { 
        title: 'O Direito de Ser Dono', 
        subtitle: 'A Quebra das Correntes',
        pain: 'Todo mês a fatura de aluguel chega. Você já pagou 3x o equipamento e ele ainda não é seu.',
        solution: 'Na GPS MY, você adquire o equipamento e ele é seu patrimônio definitivo. Sem mensalidades.',
        result: 'Você olha pro veículo e bate no peito: "Isso aqui é MEU!"'
      },
      { 
        title: 'Bloqueio Implacável', 
        subtitle: 'O Crime Termina Aqui',
        pain: 'O assalto. O ladrão levando o fruto de meses de trabalho.',
        solution: 'Com um toque no app, o motor é cortado à distância. O crime termina sob seu comando.',
        result: 'A justiça é feita no tempo de um clique. Você retoma o que é seu.'
      },
    ],
  },
  {
    id: 'gps-love',
    name: 'GPS LOVE',
    tagline: 'Rastreamos Quem Você Ama.',
    color: '#EC4899',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    logo: logos['gps-love'],
    icon: Heart,
    heroImage: '/ABA DA EMPRESA/IMAGENS/gps love logo.png',
    whoAreWe: `A GPS LOVE não nasceu de engenheiros; nascemos do medo real de quem já perdeu o sono esperando um filho chegar.

Nascemos da angústia de uma filha que viu o pai idoso esquecer o caminho de casa. Nascemos do luto de quem teve o melhor amigo de quatro patas arrancado do quintal.

Somos a força global protegendo o que é sagrado: a sua família.`,
    whyExist: `Existimos porque o mundo lá fora é cruel e não avisa quando vai bater. Existimos para que o 'e se?' nunca mais encerre a sua história.

Nossa missão é valorizar a vida em sua forma mais frágil e preciosa.`,
    howWeSolve: [
      { icon: Camera, title: 'Câmera com Visor', desc: 'Veja tudo em tempo real' },
      { icon: Target, title: 'Tags Localizadoras', desc: 'Localize o precioso' },
      { icon: Heart, title: 'Rastreamento Familiar', desc: 'Proteja quem ama' },
      { icon: Radar, title: 'Alertas Inteligentes', desc: 'Notificações instantâneas' },
      { icon: MapPin, title: 'Histórico de Rota', desc: 'Saiba por onde andaram' },
      { icon: Siren, title: 'SOS Emergencial', desc: 'Um toque para ajuda' },
    ],
    stats: [
      { value: '🏠', label: 'Monitoramento Doméstico' },
      { value: '👴', label: 'Proteção Idosos' },
      { value: '🐕', label: 'Rastreador Pet' },
      { value: '🚗', label: 'Veículos' },
    ],
    stories: [
      { 
        title: 'O Sequestro Relâmpago', 
        subtitle: 'O Rastro que Salvou Meu Filho',
        pain: 'Seu filho sumiu. Celular na caixa postal. O frio na espinha vira pânico.',
        solution: 'O rastreador mostra a rota em tempo real. Você entrega o mapa para a polícia.',
        result: 'A abordagem é feita a tempo. O abraço na delegacia é o momento que a vida recomeça.'
      },
      { 
        title: 'O Idoso Perdido', 
        subtitle: 'Quando a Rua Vira Labirinto',
        pain: 'Seu pai saiu para comprar pão e não encontrou o caminho de volta.',
        solution: 'O histórico mostra que ele está a 2km, sentado em uma praça.',
        result: 'Você o encontra, dá um banho e o coloca pra descansar. A tecnologia salvou a dignidade.'
      },
      { 
        title: 'O Pet Roubado', 
        subtitle: 'O Resgate do Membro da Família',
        pain: 'Pularam o muro e levaram o cachorro do seu filho.',
        solution: 'A Tag GPS na coleira mostra: ele está numa feira do outro lado da cidade.',
        result: 'O cachorro pula no seu colo. A família está completa de novo.'
      },
    ],
  },
  {
    id: 'rastremix',
    name: 'RASTREMIX',
    tagline: 'Tudo em Rastreamento.',
    color: '#F97316',
    gradient: 'from-orange-500 via-orange-600 to-red-500',
    logo: logos['rastremix'],
    icon: Radar,
    heroImage: '/ABA DA EMPRESA/IMAGENS/RASTREMIX 1.png',
    whoAreWe: `A Rastremix não é feita de chips e satélites; somos feitos de pessoas que acreditam que o amor é o maior patrimônio.

Somos uma família global que cuida da sua. Trazemos a força de uma multinacional para o portão da sua casa, com o carinho de quem sabe o seu nome.

Somos o abraço invisível que te acompanha em cada curva.`,
    whyExist: `Existimos para que o medo nunca seja o passageiro da sua jornada. Sabemos que, nas ruas do Brasil, cada saída de casa é um ato de coragem.

Nossa missão é transformar a incerteza das ruas na paz da sua sala de estar.`,
    howWeSolve: [
      { icon: Car, title: 'Rastreamento Total', desc: 'Veículos e pessoas' },
      { icon: ShieldCheck, title: 'Central 24h', desc: 'Monitoramento constante' },
      { icon: Zap, title: 'Resposta Rápida', desc: 'Equipes especializadas' },
      { icon: Eye, title: 'Olhos de Anjo', desc: 'Vigilância permanente' },
      { icon: Lock, title: 'Bloqueio Imediato', desc: 'Controle total' },
      { icon: Users2, title: 'Cobertura Total', desc: 'Família protegida' },
    ],
    stats: [
      { value: '9', label: 'Histórias de Sucesso' },
      { value: '100%', label: 'Cobertura Nacional' },
      { value: '24/7', label: 'Central Ativa' },
      { value: '∞', label: 'Proteção' },
    ],
    stories: [
      { 
        title: 'Rastreamento Total', 
        subtitle: 'O Reencontro Mais Esperado',
        pain: '22h. O jantar está na mesa, mas a cadeira do seu filho está vazia. O carro sumiu.',
        solution: 'A tecnologia global da Rastremix é a luz. O aplicativo mostra o caminho exato.',
        result: 'O medo vira alívio. A polícia chega no lugar certo. O abraço na porta diz tudo.'
      },
      { 
        title: 'Central 24h', 
        subtitle: 'O Coração que Bate por Você',
        pain: 'Madrugada. Você acorda com um barulho. Está sozinho no escuro.',
        solution: 'Em nossa central, as luzes estão acesas. Tem alguém olhando por você.',
        result: 'Você vira para o lado e volta a dormir. Você nunca está desamparado.'
      },
      { 
        title: 'Anti-Furto Automático', 
        subtitle: 'A Paz de Voltar e Encontrar',
        pain: 'Você para pra comprar pão. Ao sair, o coração dispara: Cadê minha moto?',
        solution: 'Assim que você desligou a chave, o anjo eletrônico travou tudo.',
        result: 'Você coloca a sacola no banco e segue com um sorriso. O sustento está intacto.'
      },
    ],
  },
  {
    id: 'telensat',
    name: 'TELENSAT',
    tagline: 'Autoridade Global do Seu Pátio.',
    color: '#3B82F6',
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    logo: logos['telensat'],
    icon: Cpu,
    heroImage: '/ABA DA EMPRESA/IMAGENS/tel logo.png',
    whoAreWe: `A Telensat é uma multinacional de tecnologia telemática e IOT com padrão internacional.

Nascemos para resolver o que ninguém mais resolve: a entrega da frota 100% pronta para a inspeção Vale.

Nosso diferencial é a precisão: Rotagrama configurado, Gestão de Multas Automatizada e instalação completa com o rigor que a Vale exige.`,
    whyExist: `Existimos para que o rigor do Padrão Vale deixe de ser um pesadelo logístico e se torne a sua maior vantagem competitiva.

Nossa missão é eliminar a incerteza do gestor e proteger o seu contrato.`,
    howWeSolve: [
      { icon: Fingerprint, title: 'Leitor RFID', desc: 'Identificação de condutores' },
      { icon: Brain, title: 'Sensor de Fadiga', desc: 'IA preventiva' },
      { icon: Compass, title: 'Rotagrama', desc: 'Velocidade por trecho' },
      { icon: TrendingUp, title: 'Gestão de Multas', desc: 'Automatizada' },
      { icon: Users, title: 'Leitor Passageiros', desc: 'Gestão de vidas' },
      { icon: Truck, title: 'Telemetria Completa', desc: 'Dados em tempo real' },
    ],
    stats: [
      { value: '100%', label: 'Padrão Vale' },
      { value: '0', label: 'Multas Acessórias' },
      { value: '24/7', label: 'Monitoramento' },
      { value: '∞', label: 'Produtividade' },
    ],
    stories: [
      { 
        title: 'RFID - Identificação', 
        subtitle: 'A Transparência no Volante',
        pain: 'Incidente durante o turno. Sem RFID, quem estava operando? A empresa sem provas.',
        solution: 'O veículo só ganha vida quando o condutor apresenta sua identidade digital.',
        result: 'A dúvida dá lugar aos fatos. O gestor tem controle e o bom profissional é protegido.'
      },
      { 
        title: 'Sensor de Fadiga', 
        subtitle: 'O Cuidado que Antecipa',
        pain: 'O turno avança e o cansaço cobra seu preço. O risco de falha humana é constante.',
        solution: 'A IA monitora sinais de atenção. Ao detectar fadiga, alerta sonoro imediato.',
        result: 'O condutor retoma o foco ou faz a pausa necessária. O risco é evitado.'
      },
      { 
        title: 'Gestão de Multas', 
        subtitle: 'A Blindagem do Caixa',
        pain: 'A infração chega tarde. O prazo de indicação expira. Multa acessória por NIC.',
        solution: 'Nossa gestão identifica a infração no sistema oficial antes mesmo da notificação.',
        result: 'O financeiro ganha controle. O prejuízo vira economia real.'
      },
    ],
  },
  {
    id: 'topy-pro',
    name: 'TOPY PRO',
    tagline: 'Proteção Veicular.',
    color: '#A855F7',
    gradient: 'from-purple-500 via-purple-600 to-violet-600',
    logo: logos['topy-pro'],
    icon: ShieldAlert,
    heroImage: '/ABA DA EMPRESA/IMAGENS/LOGO TOPY PRO.webp',
    whoAreWe: `A TOPY PRO não é apenas tecnologia; somos o parceiro de estrada de quem acorda antes do sol.

Somos feitos da fibra do trabalhador brasileiro que não tem medo de cara feia e enfrenta o trânsito para levar o pão.

Trazemos a força de uma gigante global para o guidão da sua moto, com o respeito de quem sabe o seu nome.`,
    whyExist: `Existimos porque sabemos que a rua é dura e não perdoa erros. Para você, a moto não é apenas veículo; é a sua independência, o sustento da família.

Nossa missão é ser o escudo invisível que te protege nos semáforos, nas vielas e no descanso da noite.`,
    howWeSolve: [
      { icon: Award, title: 'Garantia FIPE', desc: 'Se não recuperar, pagamos' },
      { icon: Siren, title: 'Equipe Tática', desc: 'Você nunca luta sozinho' },
      { icon: Lock, title: 'Anti-Furto', desc: 'Proteção automática' },
      { icon: Signal, title: 'Chip Multioperadora', desc: 'Sinal em qualquer lugar' },
      { icon: MapPin, title: 'Rastreamento GPS', desc: 'Precisão global' },
      { icon: Eye, title: 'Monitoramento 24h', desc: 'Central especializada' },
    ],
    stats: [
      { value: '100%', label: 'Garantia FIPE' },
      { value: '<2h', label: 'Tempo Médio Recuperação' },
      { value: '24/7', label: 'Central Tática' },
      { value: '100%', label: 'Propriedade' },
    ],
    stories: [
      { 
        title: 'Garantia FIPE', 
        subtitle: 'O Recomeço Garantido',
        pain: 'O pior aconteceu. Furto silencioso. A moto sumiu no mapa.',
        solution: 'Se não recuperarmos, nós honramos o seu suor. Pagamos o valor da FIPE.',
        result: 'O que seria o fim de um sonho vira um novo começo. O corre não para.'
      },
      { 
        title: 'Bloqueio Remoto', 
        subtitle: 'O Crime Termina Aqui',
        pain: 'Noite de chuva. O susto do assalto. O ladrão levando o ganha-pão.',
        solution: 'Um toque no app corta o motor à distância. O crime termina sob seu comando.',
        result: 'Você retoma o que é seu. A justiça é feita no tempo de um clique.'
      },
      { 
        title: 'Anti-Furto Automático', 
        subtitle: 'O Guardião Silencioso',
        pain: 'Você para a moto rapidinho. Na correria, o pensamento: Será que travei?',
        solution: 'Desligou a moto? O sistema trava automaticamente. Você não precisa fazer nada.',
        result: 'Você desce e ela está lá, firme e forte. O ladrão tentou, mas não conseguiu.'
      },
    ],
  },
  {
    id: 'valeteck',
    name: 'VALETECK',
    tagline: 'O Coração que Protege.',
    color: '#14B8A6',
    gradient: 'from-teal-500 via-teal-600 to-cyan-600',
    logo: logos['valeteck'],
    icon: HeartHandshake,
    heroImage: '/ABA DA EMPRESA/IMAGENS/Valeteck Preto.png',
    whoAreWe: `A Valeteck nasceu do respeito profundo por quem conhece o brilho do dia e o peso do trabalho.

Somos a solução que destrava o pátio com o rigor técnico exigido pela Vale, mas com a malícia da rua que só quem entende o "ganha-pão" consegue entregar.

Cuidamos da telemetria avançada com o mesmo amor que esconde um rastreador para que o crime não o desvende.`,
    whyExist: `Existimos para devolver a paz de espírito a quem move o mundo. Para que o pai de família não perca o sono e o gerente de frota não tenha o coração na mão.

Nossa razão de ser é transformar a ansiedade em tranquilidade, o risco em confiança.`,
    howWeSolve: [
      { icon: Radio, title: 'Partida Remota', desc: 'Controle até 100m' },
      { icon: Shield, title: 'Antifurto Automático', desc: 'Proteção inteligente' },
      { icon: Camera, title: 'Câmera de Ré', desc: 'Elimina pontos cegos' },
      { icon: Cpu, title: 'Telemetria Avançada', desc: 'Dados em tempo real' },
      { icon: Wrench, title: 'Instalação Profissional', desc: 'Perfeito para Vale' },
      { icon: Heart, title: 'Suporte Dedicado', desc: 'Cuidado personalizado' },
    ],
    stats: [
      { value: '100m', label: 'Alcance Partida' },
      { value: '0', label: 'Pontos Cegos' },
      { value: '100%', label: 'Padrão Vale' },
      { value: '24/7', label: 'Suporte' },
    ],
    stories: [
      { 
        title: 'Partida Remota', 
        subtitle: 'O Coração da Moto no Seu Comando',
        pain: 'Noite de chuva. Barulho na rua. Sua moto, seu ganha-pão, está lá fora.',
        solution: 'Um toque no controle, até 100 metros, você tem o poder. Ligue ou bloqueie.',
        result: 'O barulho agora é só barulho. Você olha pela janela e sente o motor vibrar.'
      },
      { 
        title: 'Câmera de Ré', 
        subtitle: 'Os Olhos que Cuidam',
        pain: 'Garagem apertada. Rua movimentada. O medo de um toque inesperado.',
        solution: 'Ao engatar a ré, a imagem clara surge. A câmera revela o que está escondido.',
        result: 'A tensão dá lugar à confiança. Estacionar se torna um ato simples.'
      },
      { 
        title: 'Antifurto Automático', 
        subtitle: 'O Guardião Silencioso',
        pain: 'Você desliga a moto e entra pra resolver. Minutos depois: Será que travei?',
        solution: 'Ele não depende da sua memória. Ao desligar, o sistema trava automaticamente.',
        result: 'A pressa não é mais inimiga. Você segue com a mente livre.'
      },
    ],
  },
];

interface EmpresaPageProps {
  onBack?: () => void;
}

export default function EmpresaPage({ onBack }: EmpresaPageProps = {}) {
  const [currentCompany, setCurrentCompany] = useState(0);
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'stories'>('hero');
  const [expandedStory, setExpandedStory] = useState<number | null>(null);
  const [showMindMap, setShowMindMap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const company = companies[currentCompany];
  const companyIcon = company.icon;

  const nextCompany = () => {
    setCurrentCompany((prev) => (prev + 1) % companies.length);
    setActiveTab('hero');
    setExpandedStory(null);
  };

  const prevCompany = () => {
    setCurrentCompany((prev) => (prev - 1 + companies.length) % companies.length);
    setActiveTab('hero');
    setExpandedStory(null);
  };

  const selectCompany = (index: number) => {
    setCurrentCompany(index);
    setActiveTab('hero');
    setExpandedStory(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${company.color}20 0%, transparent 70%)`,
            left: '50%',
            top: '50%',
            x: '-50%',
            y: '-50%',
          }}
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Voltar
            </Button>
            <motion.h1 
              className="text-lg font-bold text-white"
              key={company.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span style={{ color: company.color }}>Grupo</span> Rastremix
            </motion.h1>
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => setShowMindMap(!showMindMap)}
            >
              <Layers className="w-4 h-4 mr-1" />
              {showMindMap ? 'Portfolio' : 'Mind Map'}
            </Button>
          </div>
        </div>
      </header>

      {/* Company Pills */}
      <div className="sticky top-14 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {companies.map((c, i) => (
              <motion.button
                key={c.id}
                onClick={() => selectCompany(i)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                  currentCompany === i
                    ? 'text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
                style={currentCompany === i ? { backgroundColor: c.color } : {}}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {c.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Mind Map View */}
      <AnimatePresence>
        {showMindMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="container mx-auto px-4 py-8"
          >
            <div className="relative min-h-[80vh] flex items-center justify-center">
              {/* Central Hub */}
              <motion.div 
                className="absolute z-10 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="text-center">
                  <Globe2 className="w-12 h-12 text-white mx-auto" />
                  <span className="text-white font-bold text-sm mt-2 block">FACILIT</span>
                </div>
              </motion.div>

              {/* Orbiting Companies */}
              {companies.slice(1).map((c, i) => {
                const angle = (i * 360) / (companies.length - 1) - 90;
                const radius = 280;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                
                return (
                  <motion.div
                    key={c.id}
                    className="absolute"
                    style={{ x, y }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <motion.button
                      onClick={() => {
                        selectCompany(i + 1);
                        setShowMindMap(false);
                      }}
                      className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
                      style={{ backgroundColor: c.color }}
                      whileHover={{ scale: 1.2, zIndex: 50 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <div className="text-center">
                        <c.icon className="w-8 h-8 text-white mx-auto" />
                        <span className="text-white text-[10px] font-bold mt-1 block">{c.name.split(' ')[0]}</span>
                      </div>
                    </motion.button>
                    
                    {/* Connection Line */}
                    <svg className="absolute top-1/2 left-1/2 w-full h-full -z-10" style={{ overflow: 'visible' }}>
                      <motion.line
                        x1="50%"
                        y1="50%"
                        x2="50%"
                        y2="50%"
                        stroke={c.color}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: i * 0.2 }}
                      />
                    </svg>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio View */}
      {!showMindMap && (
        <main className="container mx-auto px-4 py-8" ref={containerRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Hero Section */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Floating Logo */}
                <motion.div 
                  className="relative inline-block mb-8"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div 
                    className="w-40 h-40 rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
                    style={{ 
                      backgroundColor: `${company.color}20`,
                      border: `2px solid ${company.color}40`
                    }}
                  >
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-32 h-32 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  {/* Glow Effect */}
                  <div 
                    className="absolute inset-0 rounded-3xl blur-xl -z-10"
                    style={{ backgroundColor: company.color, opacity: 0.3 }}
                  />
                </motion.div>

                {/* Company Name & Tagline */}
                <motion.h2 
                  className="text-5xl md:text-7xl font-black text-white mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {company.name}
                </motion.h2>
                
                <motion.p 
                  className="text-2xl font-medium mb-8"
                  style={{ color: company.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {company.tagline}
                </motion.p>

                {/* Stats Cards */}
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {company.stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10"
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                      <p className="text-3xl font-black text-white">{stat.value}</p>
                      <p className="text-sm text-white/60">{stat.label}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Navigation Tabs */}
              <div className="flex justify-center gap-2 mb-8">
                {[
                  { id: 'hero', label: 'Início' },
                  { id: 'about', label: 'Sobre' },
                  { id: 'stories', label: 'Histórias' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-2 rounded-full transition-all font-medium ${
                      activeTab === tab.id
                        ? 'text-white shadow-lg'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: company.color } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* About Section */}
              <AnimatePresence mode="wait">
                {activeTab === 'about' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="max-w-5xl mx-auto space-y-8"
                  >
                    {/* Who We Are */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
                      <div 
                        className="h-2"
                        style={{ backgroundColor: company.color }}
                      />
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                          <Users className="w-8 h-8" style={{ color: company.color }} />
                          Quem Somos
                        </h3>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {company.whoAreWe}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Why We Exist */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
                      <div 
                        className="h-2"
                        style={{ backgroundColor: company.color }}
                      />
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                          <Target className="w-8 h-8" style={{ color: company.color }} />
                          Por que Existimos
                        </h3>
                        <div className="text-white/80 leading-relaxed whitespace-pre-line">
                          {company.whyExist}
                        </div>
                      </CardContent>
                    </Card>

                    {/* How We Solve */}
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden">
                      <div 
                        className="h-2"
                        style={{ backgroundColor: company.color }}
                      />
                      <CardContent className="p-8">
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                          <Shield className="w-8 h-8" style={{ color: company.color }} />
                          Como Resolvemos
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {company.howWeSolve.map((feature, i) => (
                            <motion.div
                              key={i}
                              className="bg-white/5 rounded-xl p-4 border border-white/10"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                            >
                              <feature.icon 
                                className="w-8 h-8 mb-3" 
                                style={{ color: company.color }} 
                              />
                              <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                              <p className="text-sm text-white/60">{feature.desc}</p>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stories Section */}
              <AnimatePresence mode="wait">
                {activeTab === 'stories' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-4xl mx-auto space-y-6"
                  >
                    <h3 className="text-2xl font-bold text-white text-center mb-8">
                      As Histórias de {company.name}
                    </h3>
                    
                    {company.stories?.map((story, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card 
                          className="bg-white/5 backdrop-blur-xl border-white/10 overflow-hidden cursor-pointer"
                          onClick={() => setExpandedStory(expandedStory === i ? null : i)}
                        >
                          <div 
                            className="h-1"
                            style={{ backgroundColor: company.color }}
                          />
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <motion.div 
                                  className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                  style={{ backgroundColor: company.color }}
                                  animate={expandedStory === i ? { rotate: [0, -5, 5, 0] } : {}}
                                >
                                  {i + 1}
                                </motion.div>
                                <div>
                                  <CardTitle className="text-white text-xl">{story.title}</CardTitle>
                                  <p className="text-white/60">{story.subtitle}</p>
                                </div>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedStory === i ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronRight className="w-6 h-6 text-white/60" />
                              </motion.div>
                            </div>
                          </CardHeader>
                          
                          <AnimatePresence>
                            {expandedStory === i && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <CardContent className="space-y-6 pb-6">
                                  {/* Pain */}
                                  <div className="border-l-4 border-red-500/50 pl-4">
                                    <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                                      <AlertCircle className="w-5 h-5" />
                                      O Cenário (A Dor)
                                    </h4>
                                    <p className="text-white/80">{story.pain}</p>
                                  </div>
                                  
                                  {/* Solution */}
                                  <div className="border-l-4 border-green-500/50 pl-4">
                                    <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                                      <CheckCircle className="w-5 h-5" />
                                      Como Funciona (A Solução)
                                    </h4>
                                    <p className="text-white/80">{story.solution}</p>
                                  </div>
                                  
                                  {/* Result */}
                                  <div 
                                    className="border-l-4 pl-4"
                                    style={{ borderColor: company.color }}
                                  >
                                    <h4 
                                      className="font-bold mb-2 flex items-center gap-2"
                                      style={{ color: company.color }}
                                    >
                                      <Star className="w-5 h-5" />
                                      A Transformação
                                    </h4>
                                    <p className="text-white/80">{story.result}</p>
                                  </div>
                                </CardContent>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {/* Navigation Arrows */}
      {!showMindMap && (
        <>
          <motion.button
            onClick={prevCompany}
            className="fixed left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-8 h-8" />
          </motion.button>
          
          <motion.button
            onClick={nextCompany}
            className="fixed right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-8 h-8" />
          </motion.button>
        </>
      )}

      {/* Progress Dots */}
      {!showMindMap && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-50">
          {companies.map((c, i) => (
            <motion.button
              key={c.id}
              onClick={() => selectCompany(i)}
              className="h-3 rounded-full transition-all"
              style={{ 
                backgroundColor: currentCompany === i ? c.color : 'rgba(255,255,255,0.3)',
                width: currentCompany === i ? '32px' : '12px'
              }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 text-center border-t border-white/10 mt-12">
        <div className="flex justify-center gap-4 mb-6">
          {companies.map((c) => (
            <div
              key={c.id}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${c.color}20` }}
            >
              <c.icon className="w-5 h-5" style={{ color: c.color }} />
            </div>
          ))}
        </div>
        <p className="text-white/40 text-sm">
          Grupo Rastremix - Tecnologia e Segurança para Todos
        </p>
        <p className="text-white/20 text-xs mt-2">
          Protegendo o patrimônio nacional com coração brasileiro
        </p>
      </footer>
    </div>
  );
}
