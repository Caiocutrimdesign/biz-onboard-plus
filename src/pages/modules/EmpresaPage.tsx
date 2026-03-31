import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Heart, Shield, 
  MapPin, Zap, Users, Eye, Car, Phone, Clock, Star, Award,
  Target, Lock, Camera, Package, Truck, Battery, Signal,
  Globe, Wrench, Rocket, Sparkles, Crown, ShieldCheck,
  HeartHandshake, Cpu, Wifi, Fingerprint, EyeOff,
  TrendingUp, Building2, Users2, ShieldAlert,
  Radar, Compass, Layers, Hexagon, CircleDot, Radio, Siren,
  Play, CheckCircle, Activity, Cpu as Chip, Database, Server,
  Link2, Wifi as WifiIcon, Bluetooth, Antenna, Satellite,
  Fingerprint as Finger, Key, Zap as Bolt, Gauge, Timer,
  AlertTriangle, TrendingUp as Trend, BarChart3, PieChart,
  Rocket as RocketIcon, ShieldPlus, ShieldCheck as ShieldTick,
  Check, X, Menu, Star as StarIcon, Award as AwardIcon,
  Users as UsersIcon, Building as BuildingIcon, Car as CarIcon,
  Bike, Truck as TruckIcon, Dog, Home, HeartPulse, Baby,
  Eye as EyeIcon, Bell, MessageCircle, Navigation, MapPin as Pin,
  Phone as PhoneIcon, Mail, Clock as ClockIcon, Calendar,
  Video, Image, FileText, Download, Share2, ExternalLink,
  ChevronDown, ChevronUp, Plus, Minus, RefreshCw, Maximize2,
  Minimize2, ZoomIn, ZoomOut, Move, RotateCcw, Pause, Play as PlayIcon,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

const logos = {
  'gps-my': '/ABA%20DA%20EMPRESA/IMAGENS/Gps%20My%20Verde.png',
  'gps-love': '/ABA%20DA%20EMPRESA/IMAGENS/gps%20love%20logo.png',
  'rastremix': '/ABA%20DA%20EMPRESA/IMAGENS/RASTREMIX%201.png',
  'telensat': '/ABA%20DA%20EMPRESA/IMAGENS/tel%20logo.png',
  'topy-pro': '/ABA%20DA%20EMPRESA/IMAGENS/LOGO%20TOPY%20PRO.webp',
  'valeteck': '/ABA%20DA%20EMPRESA/IMAGENS/Valeteck%20Preto.png',
  'facilit': '/ABA%20DA%20EMPRESA/IMAGENS/lOGO%20FACILIT%20CORP.png',
  'webtrak': '/ABA%20DA%20EMPRESA/IMAGENS/Logo%20Webtrak.png',
};

const companies = [
  {
    id: 'facilit',
    name: 'FACILIT CORP',
    tagline: 'O Grupo Que Move o Brasil.',
    shortDesc: 'Matriz do ecossistema de proteção.',
    description: 'A Facilit Corp é a holding multinacional brasileira que reúne todas as empresas do grupo Rastremix. Somos um ecossistema de proteção que nasceu das ruas do Brasil, feitos de pessoas que entendem a dor de quem trabalha duro e merece o melhor.',
    color: '#FFD700',
    colorRgb: '255, 215, 0',
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
    icon: Building2,
    founded: '2018',
    employees: '500+',
    clients: '50.000+',
    presence: ['Brasil', 'América Latina'],
    certifications: ['ISO 27001', 'LGPD Compliant', 'ANVISA'],
    services: ['Rastreamento Veicular', 'Proteção Patrimonial', 'Telemetria', 'IoT'],
    technologies: ['GPS', 'Satélite', 'IoT', 'AI', 'Cloud'],
    stats: [
      { value: '50K+', label: 'Clientes', icon: UsersIcon },
      { value: '500+', label: 'Profissionais', icon: Users2 },
      { value: '98.7%', label: 'Taxa de Recuperação', icon: ShieldCheck },
      { value: '24/7', label: 'Central Online', icon: ClockIcon },
    ],
    timeline: [
      { year: '2018', event: 'Fundação da Facilit Corp' },
      { year: '2019', event: 'Expansão para 5 estados' },
      { year: '2021', event: '50.000 clientes atendidos' },
      { year: '2023', event: 'Lançamento do app Rastremix' },
      { year: '2026', event: '1.000.000 de dispositivos ativos' },
    ],
  },
  {
    id: 'gps-my',
    name: 'GPS MY',
    tagline: 'O Rastreador Que É Seu.',
    shortDesc: 'Tecnologia com propriedade definitiva.',
    description: 'A GPS MY não nasceu em escritórios de vidro; nascemos no asfalto quente, sentindo o cheiro do óleo e o peso da mochila que nunca fica leve. Vendemos tecnologia, não alugamos. Você é dono do equipamento 100%. Sem mensalidades, sem surpresas.',
    color: '#22C55E',
    colorRgb: '34, 197, 94',
    gradient: 'linear-gradient(135deg, #22C55E, #16A34A, #15803D)',
    icon: Shield,
    founded: '2019',
    employees: '150+',
    clients: '20.000+',
    presence: ['Brasil', 'Portugal', 'Espanha'],
    certifications: ['Anatel', 'CE', 'FCC'],
    services: ['Rastreador Veicular', 'Bloqueio Remoto', 'Chip Multioperadora', 'App GPS'],
    technologies: ['GPS', 'GSM', '4G', 'Bluetooth', 'RFID'],
    products: [
      { name: 'Rastreador Portátil', desc: 'Compacto e discreto', image: '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTO%20GPS%20MY/Port%C3%A1til.png' },
      { name: 'Rastreador OBD', desc: 'Plug & Play', image: '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTO%20GPS%20MY/Obd.png' },
      { name: 'Tag Localizadora', desc: 'Para objetos e pets', image: '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTO%20GPS%20MY/Tag.png' },
    ],
    stats: [
      { value: '100%', label: 'Propriedade', icon: Key },
      { value: 'R$0', label: 'Mensalidades', icon: StarIcon },
      { value: '<30s', label: 'Tempo de Bloqueio', icon: Zap },
      { value: '∞', label: 'Sem Limites', icon: Infinity },
    ],
    features: [
      { name: 'Propriedade Definitiva', progress: 100, desc: 'Equipamento é seu para sempre' },
      { name: 'Chip Multioperadora', progress: 95, desc: 'Sinal em qualquer lugar' },
      { name: 'Bloqueio Remoto', progress: 98, desc: 'Corte motor em 30 segundos' },
      { name: 'Anti-Furto Automático', progress: 92, desc: 'Detecção inteligente' },
      { name: 'Rastreamento GPS', progress: 99, desc: 'Precisão de metros' },
      { name: 'Instalação Escondida', progress: 88, desc: 'Proteção contra bandidos' },
    ],
    timeline: [
      { year: '2019', event: 'Lançamento do GPS MY' },
      { year: '2020', event: 'Primeiro rastreador sem mensalidade' },
      { year: '2022', event: 'Chip multioperadora nacional' },
      { year: '2024', event: 'App com 100K downloads' },
      { year: '2026', event: '1M de dispositivos ativos' },
    ],
  },
  {
    id: 'gps-love',
    name: 'GPS LOVE',
    tagline: 'Rastreamos Quem Você Ama.',
    shortDesc: 'Proteção para família e pets.',
    description: 'A GPS LOVE não nasceu de engenheiros; nascemos do medo real de quem já perdeu o sono esperando um filho chegar. Nascemos da angústia de uma filha que viu o pai idoso esquecer o caminho de casa. Nascemos do luto de quem teve o melhor amigo de quatro patas arrancado do quintal.',
    color: '#EC4899',
    colorRgb: '236, 72, 153',
    gradient: 'linear-gradient(135deg, #EC4899, #DB2777, #BE185D)',
    icon: Heart,
    founded: '2020',
    employees: '80+',
    clients: '15.000+',
    presence: ['Brasil', 'América Latina'],
    certifications: ['Anatel', 'CE'],
    services: ['Rastreador Familiar', 'Câmera IP', 'Tags Localizadoras', 'SOS Emergencial'],
    technologies: ['GPS', 'WiFi', 'Bluetooth', '4G', 'AI'],
    products: [
      { name: 'Câmera IP', desc: 'Visão noturna e alertas', image: '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/C%C3%82MERA.jpeg' },
      { name: 'Portátil GPS', desc: 'Para idosos e crianças', image: '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/PORT%C3%81TIL.png' },
      { name: 'Tag Pet', desc: 'Rastreador para animais', image: '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/coleira.jpeg' },
      { name: 'Tag Localizadora', desc: 'Para objetos preciosos', image: '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/TAG%20LOCALIZADORA.jpeg' },
    ],
    stats: [
      { value: '🏠', label: 'Doméstico', icon: Home },
      { value: '👴', label: 'Idosos', icon: HeartPulse },
      { value: '🐕', label: 'Pets', icon: Dog },
      { value: '🚗', label: 'Veículos', icon: CarIcon },
    ],
    features: [
      { name: 'Câmera com Visor', progress: 95, desc: 'Veja em tempo real' },
      { name: 'Tags Localizadoras', progress: 90, desc: 'Localize o precioso' },
      { name: 'Rastreamento Familiar', progress: 92, desc: 'Proteja quem ama' },
      { name: 'Alertas Inteligentes', progress: 88, desc: 'Notificações push' },
      { name: 'Histórico de Rota', progress: 85, desc: 'Saiba por onde andaram' },
      { name: 'SOS Emergencial', progress: 97, desc: 'Um toque para ajuda' },
    ],
    timeline: [
      { year: '2020', event: 'Lançamento GPS LOVE' },
      { year: '2021', event: 'Câmera IP nacional' },
      { year: '2022', event: 'Tag Pet no mercado' },
      { year: '2024', event: 'App com SOS integrado' },
      { year: '2026', event: '500K famílias protegidas' },
    ],
  },
  {
    id: 'rastremix',
    name: 'RASTREMIX',
    tagline: 'Proteção Veicular Inteligente.',
    shortDesc: 'A proteção do seu patrimônio.',
    description: 'A Rastremix não é feita de chips e satélites; somos feitos de pessoas que acreditam que o amor é o maior patrimônio. Somos uma família global que cuida da sua. Trazemos a força de uma multinacional para o portão da sua casa, com o carinho de quem sabe o seu nome.',
    color: '#F97316',
    colorRgb: '249, 115, 22',
    gradient: 'linear-gradient(135deg, #F97316, #EA580C, #DC2626)',
    icon: Radar,
    founded: '2018',
    employees: '300+',
    clients: '35.000+',
    presence: ['Brasil', 'América Latina', 'EUA'],
    certifications: ['ISO 9001', 'Anatel', 'ABVA'],
    services: ['Proteção Veicular', 'Rastreador', 'Assistência 24h', 'Guincho'],
    technologies: ['GPS', 'Satélite', '4G', 'IoT', 'AI'],
    stats: [
      { value: '24/7', label: 'Central', icon: Bell },
      { value: '<2min', label: 'Resposta', icon: Timer },
      { value: '100%', label: 'Brasil', icon: Globe },
      { value: '∞', label: 'Famílias', icon: UsersIcon },
    ],
    features: [
      { name: 'Rastreamento Total', progress: 99, desc: 'Veículos e pessoas' },
      { name: 'Central 24h', progress: 100, desc: 'SOC especializado' },
      { name: 'Resposta Rápida', progress: 95, desc: 'Média 2 minutos' },
      { name: 'Olhos de Anjo', progress: 92, desc: 'Vigilância permanente' },
      { name: 'Bloqueio Imediato', progress: 98, desc: 'Controle total' },
      { name: 'Cobertura Total', progress: 100, desc: '100% do Brasil' },
    ],
    timeline: [
      { year: '2018', event: 'Fundação Rastremix' },
      { year: '2019', event: 'Primeira central 24h' },
      { year: '2021', event: '30.000 associados' },
      { year: '2023', event: 'Expansão internacional' },
      { year: '2026', event: 'Líder no Brasil' },
    ],
  },
  {
    id: 'telensat',
    name: 'TELENSAT',
    tagline: 'Autoridade Global do Seu Pátio.',
    shortDesc: 'Telemetria para frotas pesadas.',
    description: 'A Telensat é uma multinacional de tecnologia telemática e IoT com padrão internacional. Nascemos para resolver o que ninguém mais resolve: a entrega da frota 100% pronta para a inspeção Vale. Rotagrama configurado, Gestão de Multas Automatizada e instalação completa.',
    color: '#3B82F6',
    colorRgb: '59, 130, 246',
    gradient: 'linear-gradient(135deg, #3B82F6, #2563EB, #1D4ED8)',
    icon: Cpu,
    founded: '2019',
    employees: '120+',
    clients: '5.000+',
    presence: ['Brasil', 'Chile', 'Peru'],
    certifications: ['ISO 9001', 'Vale Approved', 'ANP'],
    services: ['Telemetria', 'Gestão de Frotas', 'Sensor de Fadiga', 'RFID'],
    technologies: ['RFID', 'AI', 'IoT', 'Cloud', 'Big Data'],
    stats: [
      { value: '100%', label: 'Padrão Vale', icon: AwardIcon },
      { value: 'RFID', label: 'Identificação', icon: Finger },
      { value: 'IA', label: 'Preventiva', icon: Brain },
      { value: '24/7', label: 'Suporte', icon: PhoneIcon },
    ],
    features: [
      { name: 'Leitor RFID', progress: 98, desc: 'Identificação de condutores' },
      { name: 'Sensor de Fadiga', progress: 95, desc: 'IA preventiva' },
      { name: 'Gestão de Multas', progress: 92, desc: 'Automatizada' },
      { name: 'Padrão Vale', progress: 100, desc: 'Certificado' },
      { name: 'Rotagrama Config', progress: 90, desc: 'Personalizado' },
      { name: 'Telemetria Avançada', progress: 94, desc: 'Dados em tempo real' },
    ],
    timeline: [
      { year: '2019', event: 'Lançamento TELENSAT' },
      { year: '2020', event: 'Aprovação Vale' },
      { year: '2022', event: 'Sensor de fadiga' },
      { year: '2024', event: 'Expansão para mineração' },
      { year: '2026', event: '1.000 frotas gerenciadas' },
    ],
  },
  {
    id: 'topy-pro',
    name: 'TOPY PRO',
    tagline: 'O Escudo do Motociclista.',
    shortDesc: 'Proteção completa para motos.',
    description: 'A TOPY PRO não é apenas tecnologia; somos o parceiro de estrada de quem acorda antes do sol. Somos feitos da fibra do trabalhador brasileiro que não tem medo de cara feia e enfrenta o trânsito para levar o pão. Garantia FIPE, rastreador escondido e SOC 24h.',
    color: '#A855F7',
    colorRgb: '168, 85, 247',
    gradient: 'linear-gradient(135deg, #A855F7, #9333EA, #7E22CE)',
    icon: ShieldAlert,
    founded: '2020',
    employees: '90+',
    clients: '12.000+',
    presence: ['Brasil'],
    certifications: ['Anatel', 'INMETRO'],
    services: ['Rastreador Moto', 'Garantia FIPE', 'Assistência 24h', 'App Moto'],
    technologies: ['GPS', '4G', 'Bluetooth', 'AI'],
    stats: [
      { value: 'FIPE', label: 'Garantia', icon: AwardIcon },
      { value: '100%', label: 'Escondido', icon: EyeOff },
      { value: '24/7', label: 'SOC', icon: Bell },
      { value: '∞', label: 'Km Protegidos', icon: Gauge },
    ],
    features: [
      { name: 'Garantia FIPE', progress: 100, desc: 'Se não recuperar, pagamos' },
      { name: 'Rastreador Escondido', progress: 95, desc: '100% invisível' },
      { name: 'Central 24h', progress: 100, desc: 'SOC motociclista' },
      { name: 'Cobertura Nacional', progress: 98, desc: 'Brasil inteiro' },
      { name: 'App Inteligente', progress: 90, desc: 'Interface moto' },
      { name: 'Instalação Profissional', progress: 92, desc: 'Técnicos especializados' },
    ],
    timeline: [
      { year: '2020', event: 'Lançamento TOPY PRO' },
      { year: '2021', event: 'Garantia FIPE' },
      { year: '2022', event: '10.000 motos protegidas' },
      { year: '2024', event: 'App motoqueiro' },
      { year: '2026', event: '200K motos rastreadas' },
    ],
  },
  {
    id: 'valeteck',
    name: 'VALETECK',
    tagline: 'Controle Total do Seu Pátio.',
    shortDesc: 'Telemetria para pesados e empilhadeiras.',
    description: 'A Valeteck nasceu do respeito profundo por quem conhece o brilho do dia e o peso do trabalho. Somos a solução que destrava o pátio com o rigor técnico exigido pela Vale, mas com a malícia da rua que só quem entende o "ganha-pão" consegue entregar.',
    color: '#06B6D4',
    colorRgb: '6, 182, 212',
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2, #0E7490)',
    icon: Radio,
    founded: '2019',
    employees: '70+',
    clients: '2.000+',
    presence: ['Brasil'],
    certifications: ['ISO 9001', 'Vale Approved', 'NR'],
    services: ['Partida Remota', 'Telemetria', 'Gestão de Pátio', 'Câmera de Ré'],
    technologies: ['RFID', 'IoT', '4G', 'AI', 'Cloud'],
    stats: [
      { value: '100m', label: 'Alcance', icon: Antenna },
      { value: '24/7', label: 'Monitoramento', icon: EyeIcon },
      { value: 'Vale', label: 'Certificado', icon: AwardIcon },
      { value: '∞', label: 'Veículos', icon: TruckIcon },
    ],
    features: [
      { name: 'Partida Remota', progress: 95, desc: 'Controle até 100m' },
      { name: 'Antifurto Automático', progress: 92, desc: 'Proteção inteligente' },
      { name: 'Câmera de Ré', progress: 88, desc: 'Elimina pontos cegos' },
      { name: 'Telemetria Avançada', progress: 94, desc: 'Dados em tempo real' },
      { name: 'Instalação Profissional', progress: 90, desc: 'Perfeito para Vale' },
      { name: 'Gestão de Pátio', progress: 85, desc: 'Controle total' },
    ],
    timeline: [
      { year: '2019', event: 'Lançamento VALETECK' },
      { year: '2020', event: 'Partida remota' },
      { year: '2022', event: 'Aprovação Vale' },
      { year: '2024', event: 'Gestão de pátio' },
      { year: '2026', event: '10.000 equipamentos' },
    ],
  },
  {
    id: 'webtrak',
    name: 'WEBTRAK',
    tagline: 'Gestão Inteligente de Frotas.',
    shortDesc: 'Plataforma web completa.',
    description: 'A WebTrak é a plataforma web completa para gestão de frotas com rastreamento em tempo real. Relatórios PDF, geofencing, alertas inteligentes e multi-usuários. Tudo em um só lugar, acessível de qualquer dispositivo.',
    color: '#8B5CF6',
    colorRgb: '139, 92, 246',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED, #6D28D9)',
    icon: Globe,
    founded: '2020',
    employees: '50+',
    clients: '3.000+',
    presence: ['Brasil', 'América Latina'],
    certifications: ['ISO 27001', 'SOC 2'],
    services: ['Gestão de Frotas', 'Rastreamento Web', 'Relatórios', 'Geofencing'],
    technologies: ['Cloud', 'Big Data', 'AI', 'Real-time'],
    stats: [
      { value: 'Web', label: 'Plataforma', icon: Globe },
      { value: 'PDF', label: 'Relatórios', icon: FileText },
      { value: '∞', label: 'Usuários', icon: UsersIcon },
      { value: '24/7', label: 'Acesso', icon: ClockIcon },
    ],
    features: [
      { name: 'Gestão de Frotas', progress: 95, desc: 'Controle total' },
      { name: 'Rastreamento Web', progress: 98, desc: 'Tempo real' },
      { name: 'Relatórios PDF', progress: 92, desc: 'Exportação fácil' },
      { name: 'Geofencing', progress: 90, desc: 'Cercas virtuais' },
      { name: 'Alertas Inteligentes', progress: 88, desc: 'Notificações push' },
      { name: 'Multi-usuários', progress: 94, desc: 'Até 50 usuários' },
    ],
    timeline: [
      { year: '2020', event: 'Lançamento WebTrak' },
      { year: '2021', event: 'Relatórios PDF' },
      { year: '2023', event: 'Geofencing' },
      { year: '2025', event: 'App mobile' },
      { year: '2026', event: 'IA para decisões' },
    ],
  },
];

function CyberButton({ children, onClick, variant = 'primary', size = 'md', icon: Icon, disabled }: any) {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30',
    secondary: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 shadow-lg shadow-purple-500/30',
    outline: 'border-2 border-cyan-500/50 bg-transparent hover:bg-cyan-500/10',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-xl font-bold text-white
        transition-all duration-300
        ${variants[variant]} ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {Icon && <Icon className="w-5 h-5" />}
        {children}
      </span>
    </button>
  );
}

function GlitchText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative ${className}`}>
      {children}
    </span>
  );
}

function HolographicCard({ children, color, className }: { children: React.ReactNode; color: string; className?: string }) {
  return (
    <div
      className={`
        relative rounded-3xl overflow-hidden
        bg-gradient-to-br from-gray-900/90 to-gray-950/90
        backdrop-blur-xl border border-white/10
        ${className}
      `}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `linear-gradient(135deg, ${color}40, transparent, ${color}20)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ParticleExplosion({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div 
        className="absolute w-2 h-2 rounded-full"
        style={{
          background: color,
          boxShadow: `0 0 10px ${color}`,
          left: '50%',
          top: '50%',
        }}
      />
    </div>
  );
}

function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    const numericMatch = value.match(/[\d,.]+/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }
    
    const targetNum = parseFloat(numericMatch[0].replace(/,/g, ''));
    const prefix = value.substring(0, value.indexOf(numericMatch[0]));
    const suffix = value.substring(value.indexOf(numericMatch[0]) + numericMatch[0].length);
    
    const isDecimal = numericMatch[0].includes('.') || numericMatch[0].includes(',');
    const decimals = isDecimal ? (numericMatch[0].split(/[.,]/)[1]?.length || 0) : 0;
    
    let start = 0;
    const increment = targetNum / (duration * 60);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetNum) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(prefix + start.toFixed(decimals).replace('.', ',') + suffix);
      }
    }, 1000 / 60);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{displayValue}</span>;
}

function TechIcon({ icon: Icon, color, size = 'md' }: { icon: any; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8', md: 'w-12 h-12', lg: 'w-16 h-16' };
  
  return (
    <motion.div
      className={`${sizes[size]} rounded-xl flex items-center justify-center`}
      style={{ backgroundColor: `${color}20` }}
      whileHover={{ rotate: 360 }}
      transition={{ duration: 0.5 }}
    >
      <Icon className={`${sizes[size].replace('w-', 'w-').replace(' h-', ' h-').split(' ')[0]}`} style={{ color }} />
    </motion.div>
  );
}

function ProgressBar({ progress, color, label }: { progress: number; color: string; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span style={{ color }}>{progress}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function TimelineItem({ year, event, isActive, color }: { year: string; event: string; isActive: boolean; color: string }) {
  return (
    <motion.div
      className="flex gap-4 items-start"
      initial={{ opacity: 0.5, x: -20 }}
      animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
    >
      <div className="relative">
        <motion.div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: isActive ? color : '#374151' }}
          animate={isActive ? { scale: [1, 1.5, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        />
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color, opacity: 0.3 }}
            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      <div className="pb-6">
        <span className="text-sm font-mono" style={{ color }}>{year}</span>
        <p className="text-white/80 text-sm mt-1">{event}</p>
      </div>
    </motion.div>
  );
}

function InfinityIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <motion.path
        d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        animate={{ pathLength: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

function LogoGrid({ onSelect, selectedId }: { onSelect: (id: string) => void; selectedId: string }) {
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
      {companies.map((c) => (
        <motion.button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`
            relative p-3 rounded-2xl transition-all duration-500
            ${selectedId === c.id ? 'bg-white/20 scale-110' : 'bg-white/5 hover:bg-white/10'}
          `}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="relative z-10">
            <img 
              src={logos[c.id as keyof typeof logos]} 
              alt={c.name}
              className={`w-full h-12 object-contain transition-all duration-500 ${
                selectedId === c.id ? 'brightness-110 saturate-125' : 'brightness-75 saturate-75'
              }`}
            />
          </div>
          {selectedId === c.id && (
            <motion.div
              layoutId="activeLogo"
              className="absolute inset-0 rounded-2xl border-2"
              style={{ borderColor: c.color }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}

function ProductCard({ product, color }: { product: any; color: string }) {
  return (
    <motion.div
      className="relative group"
      whileHover={{ y: -10 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl blur-xl group-hover:from-white/10 transition-all" />
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 rounded-2xl overflow-hidden border border-white/10">
        <div className="aspect-video bg-black/50">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-contain p-4"
          />
        </div>
        <div className="p-4">
          <h4 className="font-bold text-white text-sm">{product.name}</h4>
          <p className="text-white/60 text-xs mt-1">{product.desc}</p>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: color }}
        />
      </div>
    </motion.div>
  );
}

function SpaceBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950" />
      
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <radialGradient id="nebula1" cx="20%" cy="30%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nebula2" cx="80%" cy="60%" r="40%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nebula3" cx="50%" cy="80%" r="35%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#nebula1)" />
        <rect width="100%" height="100%" fill="url(#nebula2)" />
        <rect width="100%" height="100%" fill="url(#nebula3)" />
      </svg>
    </div>
  );
}

interface EmpresaPageProps {
  onBack?: () => void;
}

export default function EmpresaPage({ onBack }: EmpresaPageProps = {}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('facilit');
  const [activeTab, setActiveTab] = useState('info');
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const company = companies.find(c => c.id === selectedCompanyId) || companies[0];
  
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950 text-white overflow-auto">
      <SpaceBackground />
      
      <div className="relative z-10">
        <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-cyan-500/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onBack && (
                  <CyberButton variant="outline" size="sm" icon={ChevronLeft} onClick={onBack}>
                    Voltar
                  </CyberButton>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-wider">
                      <GlitchText className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                        A EMPRESA
                      </GlitchText>
                    </h1>
                    <p className="text-xs text-cyan-400/70 font-mono tracking-widest">ECOSSISTEMA RASTRAMIX</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/30">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-xs font-mono text-cyan-400">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <section className="py-8 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <Badge className="mb-4 px-6 py-2 text-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400 backdrop-blur">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mr-2"
                >
                  ▸
                </motion.span>
                ECOSSISTEMA DE PROTEÇÃO
              </Badge>
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                  O Grupo Que Move
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  o Brasil
                </span>
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                8 empresas.unidas pela missão de proteger o patrimônio nacional com tecnologia de ponta e coração de brasileiro.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-12"
            >
              <LogoGrid onSelect={setSelectedCompanyId} selectedId={selectedCompanyId} />
            </motion.div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <HolographicCard color={company.color} className="p-8">
                  <div className="flex items-start gap-6">
                    <div
                      className="w-32 h-32 rounded-2xl overflow-hidden flex items-center justify-center"
                      style={{ background: `${company.color}20` }}
                    >
                      <img 
                        src={logos[company.id as keyof typeof logos]} 
                        alt={company.name}
                        className="w-28 h-28 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <motion.h3
                        className="text-4xl font-black mb-2"
                        style={{
                          background: `linear-gradient(135deg, ${company.color}, white)`,
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                        animate={{ textShadow: [`0 0 20px ${company.color}50`, `0 0 40px ${company.color}80`, `0 0 20px ${company.color}50`] }}
                      >
                        {company.name}
                      </motion.h3>
                      <p className="text-xl text-white/80 font-semibold mb-2">{company.tagline}</p>
                      <p className="text-white/60">{company.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="info" className="data-[state=active]:bg-cyan-500/20">Info</TabsTrigger>
                        <TabsTrigger value="tech" className="data-[state=active]:bg-cyan-500/20">Tech</TabsTrigger>
                        <TabsTrigger value="products" className="data-[state=active]:bg-cyan-500/20">Produtos</TabsTrigger>
                        <TabsTrigger value="timeline" className="data-[state=active]:bg-cyan-500/20">Timeline</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="info" className="mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="text-lg font-bold text-cyan-400">Estatísticas</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {company.stats.map((stat, idx) => (
                                <motion.div
                                  key={idx}
                                  className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer"
                                  onMouseEnter={() => setHoveredStat(idx)}
                                  onMouseLeave={() => setHoveredStat(null)}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <stat.icon className="w-5 h-5" style={{ color: company.color }} />
                                    <span className="text-2xl font-black" style={{ color: company.color }}>
                                      <AnimatedCounter value={stat.value} />
                                    </span>
                                  </div>
                                  <p className="text-sm text-white/60">{stat.label}</p>
                                  {hoveredStat === idx && (
                                    <ParticleExplosion color={company.color} />
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-lg font-bold text-cyan-400">Informações</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-white/60">Fundação</span>
                                <span className="font-bold" style={{ color: company.color }}>{company.founded}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-white/60">Funcionários</span>
                                <span className="font-bold" style={{ color: company.color }}>{company.employees}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-white/60">Clientes</span>
                                <span className="font-bold" style={{ color: company.color }}>{company.clients}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <span className="text-white/60">Presença</span>
                                <span className="font-bold text-right text-sm" style={{ color: company.color }}>{company.presence.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="tech" className="mt-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="text-lg font-bold text-cyan-400">Tecnologias</h4>
                            <div className="flex flex-wrap gap-2">
                              {company.technologies.map((tech, idx) => (
                                <motion.span
                                  key={idx}
                                  className="px-4 py-2 rounded-full text-sm font-bold bg-white/5 border border-white/10"
                                  style={{ borderColor: `${company.color}50` }}
                                  whileHover={{ scale: 1.1, borderColor: company.color }}
                                >
                                  {tech}
                                </motion.span>
                              ))}
                            </div>
                            <h4 className="text-lg font-bold text-cyan-400 mt-6">Certificações</h4>
                            <div className="flex flex-wrap gap-2">
                              {company.certifications?.map((cert, idx) => (
                                <motion.span
                                  key={idx}
                                  className="px-4 py-2 rounded-lg text-sm font-mono bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  ✓ {cert}
                                </motion.span>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="text-lg font-bold text-cyan-400">Serviços</h4>
                            <div className="space-y-2">
                              {company.services?.map((service, idx) => (
                                <motion.div
                                  key={idx}
                                  className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: idx * 0.1 }}
                                >
                                  <Check className="w-5 h-5" style={{ color: company.color }} />
                                  <span className="text-white/80">{service}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="products" className="mt-6">
                        {company.products && company.products.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {company.products.map((product, idx) => (
                              <ProductCard key={idx} product={product} color={company.color} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 text-white/40">
                            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>Produtos em desenvolvimento</p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="timeline" className="mt-6">
                        <div className="relative pl-6">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500" />
                          {company.timeline.map((item, idx) => (
                            <TimelineItem
                              key={idx}
                              year={item.year}
                              event={item.event}
                              isActive={idx === company.timeline.length - 1}
                              color={company.color}
                            />
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </HolographicCard>
              </div>
              
              <div className="space-y-6">
                <HolographicCard color={company.color} className="p-6">
                  <h4 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Funcionalidades
                  </h4>
                  <div className="space-y-4">
                    {company.features?.map((feature, idx) => (
                      <ProgressBar
                        key={idx}
                        progress={feature.progress}
                        color={company.color}
                        label={feature.name}
                      />
                    ))}
                  </div>
                </HolographicCard>
                
                <HolographicCard color={company.color} className="p-6">
                  <h4 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Presença Global
                  </h4>
                  <div className="space-y-3">
                    {company.presence?.map((place, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-center gap-3"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.2 }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: company.color }} />
                        <span className="text-white/80">{place}</span>
                      </motion.div>
                    ))}
                  </div>
                </HolographicCard>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-20 px-4 bg-gradient-to-b from-gray-950 to-gray-900">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-black mb-4">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Todas as Empresas
                </span>
              </h3>
              <p className="text-white/60">Clique em uma empresa para explorar</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {companies.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedCompanyId(c.id)}
                  className={`
                    cursor-pointer p-6 rounded-3xl
                    bg-gradient-to-br from-gray-900/80 to-gray-950/80
                    backdrop-blur-xl border border-white/10
                    hover:border-cyan-500/50 transition-all duration-300
                    ${selectedCompanyId === c.id ? 'ring-2 ring-cyan-500' : ''}
                  `}
                  whileHover={{ y: -10 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <motion.div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 overflow-hidden"
                      style={{ background: `${c.color}20` }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <img src={logos[c.id as keyof typeof logos]} alt={c.name} className="w-16 h-16 object-contain" />
                    </motion.div>
                    <h4 className="font-bold text-white mb-1">{c.name}</h4>
                    <p className="text-xs text-white/50">{c.shortDesc}</p>
                    <div
                      className="mt-4 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: `${c.color}20`, color: c.color }}
                    >
                      {c.tagline}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-black mb-4">
                <GlitchText className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Ecossistema Conectado
                </GlitchText>
              </h3>
              <p className="text-white/60">Todas as empresas trabalhando juntas para sua proteção</p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <motion.div
                  className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/50"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 40px rgba(249, 115, 22, 0.5)',
                      '0 0 80px rgba(249, 115, 22, 0.8)',
                      '0 0 40px rgba(249, 115, 22, 0.5)',
                    ]
                  }}
                >
                  <img src={logos['rastremix']} alt="Rastremix" className="w-28 h-28 object-contain" />
                </motion.div>
                
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
                  <circle
                    cx="50%"
                    cy="50%"
                    r="150"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="1"
                    strokeDasharray="10 10"
                    className="animate-spin"
                    style={{ transformOrigin: 'center', animationDuration: '20s' }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="50%" stopColor="#A855F7" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
                
                <div className="absolute inset-0" style={{ zIndex: -1 }}>
                  {companies.slice(0, 7).map((c, idx) => {
                    const angle = (idx / 7) * 2 * Math.PI - Math.PI / 2;
                    const x = Math.cos(angle) * 180;
                    const y = Math.sin(angle) * 180;
                    return (
                      <motion.div
                        key={c.id}
                        className="absolute cursor-pointer"
                        style={{ left: `calc(50% + ${x}px - 30px)`, top: `calc(50% + ${y}px - 30px)` }}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setSelectedCompanyId(c.id)}
                      >
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                          style={{ background: `${c.color}30`, boxShadow: `0 0 20px ${c.color}50` }}
                        >
                          <img src={logos[c.id as keyof typeof logos]} alt={c.name} className="w-12 h-12 object-contain" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <footer className="py-12 px-4 border-t border-cyan-500/20 bg-black/50">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img src={logos['rastremix']} alt="Rastremix" className="h-12 object-contain" />
                <div>
                  <h4 className="font-bold">RASTRAMIX</h4>
                  <p className="text-sm text-white/50">Proteção Veicular Inteligente</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {companies.slice(0, 5).map((c) => (
                  <motion.img
                    key={c.id}
                    src={logos[c.id as keyof typeof logos]}
                    alt={c.name}
                    className="h-8 object-contain opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setSelectedCompanyId(c.id)}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-white/30 text-sm font-mono">
                © 2026 RASTRAMIX - O Grupo Que Move o Brasil. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
