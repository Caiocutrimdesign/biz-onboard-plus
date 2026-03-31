import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Heart, Shield, 
  MapPin, Zap, Users, Eye, Car, Phone, Clock, Star, Award,
  Target, Lock, Camera, Package, Truck, Battery, Signal,
  Globe, Wrench, Rocket, Sparkles, Crown, ShieldCheck,
  HeartHandshake, Cpu, Wifi, Fingerprint, EyeOff,
  TrendingUp, Building2, Users2, ShieldAlert,
  Radar, Compass, Layers, Hexagon, CircleDot, Radio, Siren,
  ChevronDown, Menu, X, ExternalLink, Download, Play, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const encodePath = (path) => {
  return path.split('/').map(part => encodeURIComponent(part)).join('/');
};

const logos = {
  'gps-my': '/ABA%20DA%20EMPRESA/IMAGENS/Gps%20my.png',
  'gps-my-verde': '/ABA%20DA%20EMPRESA/IMAGENS/Gps%20My%20Verde.png',
  'gps-love': '/ABA%20DA%20EMPRESA/IMAGENS/gps%20love%20logo.png',
  'gps-love-img': '/ABA%20DA%20EMPRESA/IMAGENS/Gps%20love.png',
  'gps-joy': '/ABA%20DA%20EMPRESA/IMAGENS/Gps%20joy.png',
  'rastremix': '/ABA%20DA%20EMPRESA/IMAGENS/RASTREMIX%201.png',
  'rastremix-2': '/ABA%20DA%20EMPRESA/IMAGENS/RASTREMIX%202.png',
  'telensat': '/ABA%20DA%20EMPRESA/IMAGENS/tel%20logo.png',
  'telensat-azul': '/ABA%20DA%20EMPRESA/IMAGENS/TELENSAT%20AZUL.png',
  'topy-pro': '/ABA%20DA%20EMPRESA/IMAGENS/LOGO%20TOPY%20PRO.webp',
  'topy-pro-branca': '/ABA%20DA%20EMPRESA/IMAGENS/TOPY%20PRO%20BRANCA.png',
  'valeteck': '/ABA%20DA%20EMPRESA/IMAGENS/Valeteck%20Preto.png',
  'valeteck-branco': '/ABA%20DA%20EMPRESA/IMAGENS/Valeteck%20Branco.png',
  'facilit': '/ABA%20DA%20EMPRESA/IMAGENS/lOGO%20FACILIT%20CORP.png',
  'webtrak': '/ABA%20DA%20EMPRESA/IMAGENS/Logo%20Webtrak.png',
  'gps-my-obd': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTO%20GPS%20MY/Obd.png',
  'gps-my-portatil': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTO%20GPS%20MY/Port%C3%A1til.png',
  'gps-my-tag': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTO%20GPS%20MY/Tag.png',
  'gps-love-arte': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/Arte%20feed%20gps%20love.png',
  'gps-love-camera': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/C%C3%82MERA.jpeg',
  'gps-love-portatil': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/PORT%C3%81TIL.png',
  'gps-love-tag': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/TAG%20LOCALIZADORA.jpeg',
  'gps-love-coleira': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/coleira.jpeg',
  'rastremix-camiseta': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/Replace_the_red_Rastremix_t-shirt_with_the_blue_an-1772898819844%20(3).png',
  'rastremix-whatsapp': '/ABA%20DA%20EMPRESA/IMAGENS/IMAGENS%20PRODUTOS/WhatsApp%20Image%202026-03-03%20at%2018.17.58.jpeg',
};

const companies = [
  {
    id: 'facilit',
    name: 'FACILIT CORP',
    tagline: 'O Grupo Que Move o Brasil.',
    description: 'Multinacional brasileira que reúne as mais avançadas tecnologias de rastreamento e segurança.',
    color: '#FFD700',
    colorRgb: '255, 215, 0',
    gradient: 'from-yellow-500 via-amber-500 to-orange-600',
    darkGradient: 'from-yellow-900/80 via-amber-900/80 to-orange-900/80',
    logo: `/${logos['facilit']}`,
    alternateLogos: [`/${logos['facilit']}`],
    icon: Building2,
    features: ['Tecnologia Multinacional', 'Equipe Especializada', 'Resposta Imediata', 'Cobertura Nacional', 'Certificações ISO', 'Atendimento 24/7'],
    stats: [
      { value: '50K+', label: 'Clientes' },
      { value: '98.7%', label: 'Taxa de Recuperação' },
      { value: '24/7', label: 'Monitoramento' },
      { value: '500+', label: 'Profissionais' },
    ],
    products: [],
  },
  {
    id: 'gps-my',
    name: 'GPS MY',
    tagline: 'O Rastreador Que É Seu.',
    description: 'Tecnologia de rastreamento com propriedade definitiva - você é dono do equipamento, sem mensalidades.',
    color: '#22C55E',
    colorRgb: '34, 197, 94',
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
    darkGradient: 'from-green-900/80 via-emerald-900/80 to-teal-900/80',
    logo: `/${logos['gps-my-verde']}`,
    alternateLogos: [`/${logos['gps-my']}`, `/${logos['gps-my-verde']}`],
    icon: Shield,
    features: ['Propriedade Definitiva', 'Chip Multioperadora', 'Bloqueio Remoto', 'Anti-Furto Automático', 'Rastreamento GPS', 'Instalação Estratégica'],
    stats: [
      { value: '100%', label: 'Propriedade' },
      { value: 'R$0', label: 'Mensalidades' },
      { value: '<30s', label: 'Tempo de Bloqueio' },
      { value: '∞', label: 'Sem Limites' },
    ],
    products: [`/${logos['gps-my-obd']}`, `/${logos['gps-my-portatil']}`, `/${logos['gps-my-tag']}`],
  },
  {
    id: 'gps-love',
    name: 'GPS LOVE',
    tagline: 'Rastreamos Quem Você Ama.',
    description: 'Proteção para sua família, idosos, pets e veículos com amor e tecnologia de ponta.',
    color: '#EC4899',
    colorRgb: '236, 72, 153',
    gradient: 'from-pink-500 via-rose-500 to-red-500',
    darkGradient: 'from-pink-900/80 via-rose-900/80 to-red-900/80',
    logo: `/${logos['gps-love']}`,
    alternateLogos: [`/${logos['gps-love']}`, `/${logos['gps-love-img']}`, `/${logos['gps-joy']}`],
    icon: Heart,
    features: ['Câmera com Visor', 'Tags Localizadoras', 'Rastreamento Familiar', 'Alertas Inteligentes', 'Histórico de Rota', 'SOS Emergencial'],
    stats: [
      { value: '🏠', label: 'Doméstico' },
      { value: '👴', label: 'Idosos' },
      { value: '🐕', label: 'Pets' },
      { value: '🚗', label: 'Veículos' },
    ],
    products: [`/${logos['gps-love-arte']}`, `/${logos['gps-love-camera']}`, `/${logos['gps-love-portatil']}`, `/${logos['gps-love-tag']}`, `/${logos['gps-love-coleira']}`],
  },
  {
    id: 'rastremix',
    name: 'RASTREMIX',
    tagline: 'Proteção Veicular Inteligente.',
    description: 'Família global que cuida da sua com amor, rastreamento total e central 24h.',
    color: '#F97316',
    colorRgb: '249, 115, 22',
    gradient: 'from-orange-500 via-orange-600 to-red-500',
    darkGradient: 'from-orange-900/80 via-orange-900/80 to-red-900/80',
    logo: `/${logos['rastremix']}`,
    alternateLogos: [`/${logos['rastremix']}`, `/${logos['rastremix-2']}`],
    icon: Radar,
    features: ['Rastreamento Total', 'Central 24h', 'Resposta Rápida', 'Olhos de Anjo', 'Bloqueio Imediato', 'Cobertura Total'],
    stats: [
      { value: '24/7', label: 'Central' },
      { value: '<2min', label: 'Resposta' },
      { value: '100%', label: 'Brasil' },
      { value: '∞', label: 'Famílias' },
    ],
    products: [`/${logos['rastremix-camiseta']}`, `/${logos['rastremix-whatsapp']}`],
  },
  {
    id: 'telensat',
    name: 'TELENSAT',
    tagline: 'Autoridade Global do Seu Pátio.',
    description: 'Multinacional de tecnologia telemática e IoT com padrão internacional para frotas.',
    color: '#3B82F6',
    colorRgb: '59, 130, 246',
    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
    darkGradient: 'from-blue-900/80 via-blue-900/80 to-indigo-900/80',
    logo: `/${logos['telensat']}`,
    alternateLogos: [`/${logos['telensat']}`, `/${logos['telensat-azul']}`],
    icon: Cpu,
    features: ['Leitor RFID', 'Sensor de Fadiga', 'Gestão de Multas', 'Padrão Vale', 'Rotagrama Config', 'Telemetria Avançada'],
    stats: [
      { value: '100%', label: 'Padrão Vale' },
      { value: 'RFID', label: 'Identificação' },
      { value: 'IA', label: 'Preventiva' },
      { value: '24/7', label: 'Suporte' },
    ],
    products: [],
  },
  {
    id: 'topy-pro',
    name: 'TOPY PRO',
    tagline: 'O Escudo do Motociclista.',
    description: 'Parceiro de estrada de quem acorda antes do sol. Proteção completa para motos.',
    color: '#A855F7',
    colorRgb: '168, 85, 247',
    gradient: 'from-purple-500 via-purple-600 to-violet-600',
    darkGradient: 'from-purple-900/80 via-purple-900/80 to-violet-900/80',
    logo: `/${logos['topy-pro']}`,
    alternateLogos: [`/${logos['topy-pro']}`, `/${logos['topy-pro-branca']}`],
    icon: ShieldAlert,
    features: ['Garantia FIPE', 'Rastreador Escondido', 'Central 24h', 'Cobertura Nacional', 'App Inteligente', 'Instalação Profissional'],
    stats: [
      { value: 'FIPE', label: 'Garantia' },
      { value: '100%', label: 'Escondido' },
      { value: '24/7', label: 'SOC' },
      { value: '∞', label: 'Km Protegidos' },
    ],
    products: [],
  },
  {
    id: 'valeteck',
    name: 'VALETECK',
    tagline: 'Controle Total do Seu Pátio.',
    description: 'Solução completa para controle de pátio com telemetria avançada e padrão Vale.',
    color: '#06B6D4',
    colorRgb: '6, 182, 212',
    gradient: 'from-cyan-500 via-cyan-600 to-blue-600',
    darkGradient: 'from-cyan-900/80 via-cyan-900/80 to-blue-900/80',
    logo: `/${logos['valeteck']}`,
    alternateLogos: [`/${logos['valeteck']}`, `/${logos['valeteck-branco']}`],
    icon: Radio,
    features: ['Partida Remota', 'Antifurto Automático', 'Câmera de Ré', 'Telemetria Avançada', 'Instalação Profissional', 'Padrão Vale'],
    stats: [
      { value: '100m', label: 'Alcance' },
      { value: '24/7', label: 'Monitoramento' },
      { value: 'Vale', label: 'Certificado' },
      { value: '∞', label: 'Veículos' },
    ],
    products: [],
  },
  {
    id: 'webtrak',
    name: 'WEBTRAK',
    tagline: 'Gestão Inteligente de Frotas.',
    description: 'Plataforma web completa para gestão de frotas com rastreamento em tempo real.',
    color: '#8B5CF6',
    colorRgb: '139, 92, 246',
    gradient: 'from-violet-500 via-violet-600 to-purple-600',
    darkGradient: 'from-violet-900/80 via-violet-900/80 to-purple-900/80',
    logo: `/${logos['webtrak']}`,
    alternateLogos: [`/${logos['webtrak']}`],
    icon: Globe,
    features: ['Gestão de Frotas', 'Rastreamento Web', 'Relatórios PDF', 'Geofencing', 'Alertas Inteligentes', 'Multi-usuários'],
    stats: [
      { value: 'Web', label: 'Plataforma' },
      { value: 'PDF', label: 'Relatórios' },
      { value: '∞', label: 'Usuários' },
      { value: '24/7', label: 'Acesso' },
    ],
    products: [],
  },
];

function FloatingOrb({ delay, duration, size, color, top, left, right, bottom }: any) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl opacity-30 pointer-events-none"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        top, left, right, bottom,
      }}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, 0],
        scale: [1, 1.1, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

function ImageWithFallback({ src, alt, className, style, onClick }: { src: string; alt: string; className?: string; style?: any; onClick?: () => void }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const handleError = () => {
    console.log('Image error for:', src);
    setError(true);
  };
  
  const handleLoad = () => {
    console.log('Image loaded:', src);
    setLoaded(true);
  };
  
  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 ${className}`} style={style}>
        <div className="text-center p-4">
          <Package className="w-12 h-12 text-gray-500 mx-auto mb-2" />
          <span className="text-xs text-gray-500">{alt}</span>
        </div>
      </div>
    );
  }
  
  return (
    <motion.img
      src={src}
      alt={alt}
      className={`${className} ${loaded ? '' : 'opacity-50'}`}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: loaded ? 1 : 0.5, scale: 1 }}
    />
  );
}

function LogoCard({ logo, name, isActive, onClick, color }: { logo: string; name: string; isActive: boolean; onClick: () => void; color: string }) {
  return (
    <motion.button
      onClick={onClick}
      className={`relative p-4 rounded-2xl transition-all duration-500 ${
        isActive 
          ? 'bg-white/20 backdrop-blur-xl shadow-2xl scale-110' 
          : 'bg-white/5 hover:bg-white/10 backdrop-blur-sm'
      }`}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative z-10">
        <ImageWithFallback 
          src={logo} 
          alt={name}
          className={`w-full h-16 object-contain filter drop-shadow-lg transition-all duration-500 ${
            isActive ? 'brightness-110 saturate-125' : 'brightness-75 saturate-75'
          }`}
        />
      </div>
      {isActive && (
        <motion.div
          layoutId="activeLogo"
          className="absolute inset-0 rounded-2xl border-2"
          style={{ borderColor: color }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

function ProductGallery({ products, companyColor }: { products: string[]; companyColor: string }) {
  const [selected, setSelected] = useState(0);
  
  if (!products || products.length === 0) return null;
  
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-white flex items-center gap-2">
        <Package className="w-5 h-5" style={{ color: companyColor }} />
        Produtos
      </h4>
      
      <div className="grid grid-cols-3 gap-3">
        {products.map((img, idx) => (
          <motion.button
            key={idx}
            onClick={() => setSelected(idx)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              selected === idx ? 'border-white shadow-lg shadow-white/20' : 'border-white/20 hover:border-white/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ImageWithFallback src={img} alt={`Produto ${idx + 1}`} className="w-full h-full object-cover" />
          </motion.button>
        ))}
      </div>
      
      <motion.div
        key={selected}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative aspect-video rounded-2xl overflow-hidden bg-black/30"
      >
        <ImageWithFallback 
          src={products[selected]} 
          alt={`Produto ${selected + 1}`}
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </motion.div>
    </div>
  );
}

function Stats3D({ stats, color }: { stats: { value: string; label: string }[]; color: string }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-xl group-hover:from-white/20 transition-all" />
          <div className="relative p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/30 transition-all">
            <motion.div
              className="text-3xl md:text-4xl font-black text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(135deg, ${color}, white)` }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {stat.value}
            </motion.div>
            <div className="text-sm text-white/70 mt-1">{stat.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FeatureCard({ feature, icon: Icon, color, index }: { feature: string; icon: any; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all group"
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span className="text-sm text-white/90 group-hover:text-white transition-colors">{feature}</span>
    </motion.div>
  );
}

function MindMapNode({ company, index, total, onClick, isActive, isCenter }: { company: any; index: number; total: number; onClick: () => void; isActive: boolean; isCenter?: boolean }) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  const radius = isCenter ? 0 : 280;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  
  if (isCenter) {
    return (
      <div className="absolute flex flex-col items-center justify-center">
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-500/50"
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 0 30px rgba(249, 115, 22, 0.5)',
              '0 0 60px rgba(249, 115, 22, 0.8)',
              '0 0 30px rgba(249, 115, 22, 0.5)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <ImageWithFallback src={company.logo} alt={company.name} className="w-20 h-20 object-contain" />
        </motion.div>
        <span className="mt-2 text-white font-bold text-sm">{company.name}</span>
      </div>
    );
  }
  
  return (
    <motion.div
      className="absolute"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <motion.button
        onClick={onClick}
        className={`relative cursor-pointer`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div 
          className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            isActive ? 'scale-125' : 'grayscale hover:grayscale-0'
          }`}
          style={{ 
            background: `linear-gradient(135deg, ${company.color}, ${company.color}80)`,
            boxShadow: isActive ? `0 0 40px ${company.color}80` : `0 10px 30px rgba(0,0,0,0.3)`,
          }}
        >
          <ImageWithFallback src={company.logo} alt={company.name} className="w-14 h-14 object-contain" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 bg-black/80 backdrop-blur rounded-lg whitespace-nowrap"
        >
          <span className="text-sm font-bold" style={{ color: company.color }}>{company.name}</span>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}

function AlternatingLogosCarousel({ logos, companyName, color }: { logos: string[]; companyName: string; color: string }) {
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    setCurrent(0);
  }, [companyName]);
  
  useEffect(() => {
    if (logos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % logos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [logos.length]);
  
  if (logos.length === 0) return null;
  
  return (
    <div className="relative h-40">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <ImageWithFallback 
            src={logos[current]} 
            alt={`${companyName} logo ${current + 1}`}
            className="max-h-32 object-contain drop-shadow-2xl"
          />
        </motion.div>
      </AnimatePresence>
      
      {logos.length > 1 && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {logos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === current ? 'w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
              style={{ backgroundColor: idx === current ? color : undefined }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ParticleField() {
  const particles = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

interface EmpresaPageProps {
  onBack?: () => void;
}

export default function EmpresaPage({ onBack }: EmpresaPageProps = {}) {
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [viewMode, setViewMode] = useState<'carousel' | 'mindmap'>('carousel');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const company = companies[selectedCompany];
  const centerCompany = companies.find(c => c.id === 'rastremix') || companies[0];
  
  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-auto">
      <ParticleField />
      
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0"
      >
        <FloatingOrb delay={0} duration={6} size={400} color={`rgba(${company.colorRgb}, 0.3)`} top="10%" left="5%" />
        <FloatingOrb delay={2} duration={8} size={300} color="rgba(249, 115, 22, 0.2)" bottom="20%" right="10%" />
        <FloatingOrb delay={4} duration={7} size={350} color="rgba(59, 130, 246, 0.2)" top="40%" right="30%" />
      </motion.div>
      
      <div className="relative z-10">
        <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {onBack && (
                  <Button variant="ghost" size="sm" onClick={onBack} className="text-white hover:bg-white/10">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Voltar
                  </Button>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-white">A EMPRESA</h1>
                    <p className="text-xs text-white/60">Ecossistema Rastremix</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'carousel' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('carousel')}
                  className={viewMode === 'carousel' ? 'bg-orange-500' : 'text-white border-white/20'}
                >
                  Carousel
                </Button>
                <Button
                  variant={viewMode === 'mindmap' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('mindmap')}
                  className={viewMode === 'mindmap' ? 'bg-orange-500' : 'text-white border-white/20'}
                >
                  Mind Map
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        <section className="min-h-[70vh] flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 px-4 py-2 text-lg bg-white/10 text-white border-white/20 backdrop-blur">
                Ecossistema de Proteção
              </Badge>
              <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 mb-6">
                O Grupo Que Move o Brasil
              </h2>
              <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                8 empresas.unidas pela missão de proteger o patrimônio nacional com tecnologia de ponta e coração de brasileiro.
              </p>
              
              <motion.div
                className="flex flex-wrap justify-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {companies.map((c, idx) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedCompany(idx)}
                  >
                    <ImageWithFallback 
                      src={c.logo} 
                      alt={c.name}
                      className="w-12 h-12 object-contain hover:scale-110 transition-transform"
                      style={{ filter: selectedCompany === idx ? 'none' : 'grayscale(50%)' }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {viewMode === 'carousel' ? (
          <section className="py-20 px-4">
            <div className="container mx-auto">
              <div className="grid lg:grid-cols-5 gap-8">
                <div className="lg:col-span-1 space-y-3">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-orange-500" />
                    Empresas
                  </h3>
                  {companies.map((c, idx) => (
                    <LogoCard
                      key={c.id}
                      logo={c.logo}
                      name={c.name}
                      isActive={selectedCompany === idx}
                      onClick={() => setSelectedCompany(idx)}
                      color={c.color}
                    />
                  ))}
                </div>
                
                <div className="lg:col-span-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5 }}
                      className={`rounded-3xl bg-gradient-to-br ${company.darkGradient} backdrop-blur-xl border border-white/10 overflow-hidden`}
                    >
                      <div className={`h-2 bg-gradient-to-r ${company.gradient}`} />
                      
                      <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-12">
                          <div className="space-y-6">
                            <div>
                              <AlternatingLogosCarousel 
                                logos={company.alternateLogos} 
                                companyName={company.name}
                                color={company.color}
                              />
                            </div>
                            
                            <div>
                              <h3 className="text-4xl font-black text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${company.color}, white)` }}>
                                {company.name}
                              </h3>
                              <p className="text-2xl text-white/80 font-semibold mt-2">{company.tagline}</p>
                              <p className="text-white/60 mt-4">{company.description}</p>
                            </div>
                            
                            <div>
                              <Stats3D stats={company.stats} color={company.color} />
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div>
                              <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5" style={{ color: company.color }} />
                                Funcionalidades
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {company.features.map((feature, idx) => (
                                  <FeatureCard 
                                    key={idx}
                                    feature={feature}
                                    icon={company.icon}
                                    color={company.color}
                                    index={idx}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {company.products && company.products.length > 0 && (
                              <ProductGallery 
                                products={company.products} 
                                companyColor={company.color}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="flex justify-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setSelectedCompany((p) => (p - 1 + companies.length) % companies.length)}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Anterior
                    </Button>
                    <div className="flex items-center gap-2 px-4">
                      <span className="text-white font-bold">{selectedCompany + 1}</span>
                      <span className="text-white/50">/</span>
                      <span className="text-white/50">{companies.length}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setSelectedCompany((p) => (p + 1) % companies.length)}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      Próximo
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-20 px-4">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <h3 className="text-4xl font-black text-white mb-4">Mapa de Empresas</h3>
                <p className="text-white/60">Clique em uma empresa para saber mais</p>
              </div>
              
              <div className="relative flex flex-col items-center justify-center min-h-[800px]">
                <div className="relative w-[700px] h-[700px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 700 700">
                      <circle cx="350" cy="350" r="280" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="10 10" />
                      <circle cx="350" cy="350" r="200" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <circle cx="350" cy="350" r="120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      {[...Array(8)].map((_, i) => {
                        const angle = (i / 8) * 2 * Math.PI - Math.PI / 2;
                        const x1 = 350 + Math.cos(angle) * 120;
                        const y1 = 350 + Math.sin(angle) * 120;
                        const x2 = 350 + Math.cos(angle) * 280;
                        const y2 = 350 + Math.sin(angle) * 280;
                        return (
                          <line 
                            key={i} 
                            x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke="rgba(255,255,255,0.1)" 
                            strokeWidth="1"
                            strokeDasharray="5 5"
                          />
                        );
                      })}
                    </svg>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MindMapNode
                      company={centerCompany}
                      index={0}
                      total={1}
                      onClick={() => setSelectedCompany(companies.indexOf(centerCompany))}
                      isActive={selectedCompany === companies.indexOf(centerCompany)}
                      isCenter={true}
                    />
                  </div>
                  
                  {companies.filter(c => c.id !== 'rastremix').map((c, idx) => (
                    <MindMapNode
                      key={c.id}
                      company={c}
                      index={idx}
                      total={companies.length - 1}
                      onClick={() => setSelectedCompany(companies.indexOf(c))}
                      isActive={selectedCompany === companies.indexOf(c)}
                      isCenter={false}
                    />
                  ))}
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCompany}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="max-w-2xl w-full mt-12"
                  >
                    <Card className={`bg-gradient-to-br ${company.darkGradient} backdrop-blur-xl border-white/20`}>
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <ImageWithFallback src={company.logo} alt={company.name} className="w-16 h-16 object-contain" />
                          <div>
                            <CardTitle className="text-3xl font-black text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${company.color}, white)` }}>
                              {company.name}
                            </CardTitle>
                            <p className="text-white/80 text-lg">{company.tagline}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-white/70">{company.description}</p>
                        <Stats3D stats={company.stats} color={company.color} />
                        {company.products && company.products.length > 0 && (
                          <ProductGallery products={company.products} companyColor={company.color} />
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </section>
        )}
        
        <section className="py-20 px-4 bg-black/20">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-black text-white mb-4">Produtos em Destaque</h3>
              <p className="text-white/60">Conheça os produtos de cada empresa do ecossistema</p>
            </div>
            
            <Tabs defaultValue="gps-love" className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-2 bg-white/5 backdrop-blur mb-8">
                {companies.filter(c => c.products && c.products.length > 0).map((c) => (
                  <TabsTrigger 
                    key={c.id} 
                    value={c.id}
                    className="data-[state=active]:bg-white/20 text-white"
                  >
                    {c.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {companies.filter(c => c.products && c.products.length > 0).map((c) => (
                <TabsContent key={c.id} value={c.id}>
                  <Card className={`bg-gradient-to-br ${c.darkGradient} backdrop-blur-xl border-white/10`}>
                    <CardContent className="p-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <ImageWithFallback src={c.logo} alt={c.name} className="w-12 h-12 object-contain" />
                            <h4 className="text-2xl font-black text-white">{c.name}</h4>
                          </div>
                          <p className="text-white/70 mb-6">{c.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {c.features.slice(0, 4).map((f, idx) => (
                              <Badge key={idx} className="bg-white/10 text-white backdrop-blur">{f}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {c.products?.map((img, idx) => (
                            <motion.div
                              key={idx}
                              className="relative aspect-square rounded-xl overflow-hidden bg-black/30 group"
                              whileHover={{ scale: 1.05 }}
                            >
                              <ImageWithFallback src={img} alt={`${c.name} produto`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                <span className="text-white text-sm font-semibold">Produto {idx + 1}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
        
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-black text-white mb-4">Galeria de Logos</h3>
              <p className="text-white/60">Todas as marcas do ecossistema Rastremix</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {companies.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 rounded-3xl bg-gradient-to-br ${c.darkGradient} backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all group cursor-pointer`}
                  onClick={() => {
                    setSelectedCompany(idx);
                    setViewMode('carousel');
                  }}
                >
                  <div className="aspect-video flex items-center justify-center mb-4">
                    <ImageWithFallback 
                      src={c.logo} 
                      alt={c.name}
                      className="max-h-16 object-contain group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-white text-center">{c.name}</h4>
                  <p className="text-sm text-white/60 text-center mt-1">{c.tagline}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        <footer className="py-12 px-4 border-t border-white/10 bg-black/30">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <ImageWithFallback src={logos['rastremix'].startsWith('/') ? logos['rastremix'] : `/${logos['rastremix']}`} alt="Rastremix" className="h-12 object-contain" />
                <div>
                  <h4 className="font-bold text-white">RASTREMIX</h4>
                  <p className="text-sm text-white/60">Proteção Veicular Inteligente</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {companies.slice(0, 5).map((c) => (
                  <ImageWithFallback 
                    key={c.id}
                    src={c.logo} 
                    alt={c.name}
                    className="h-8 object-contain opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setSelectedCompany(companies.indexOf(c))}
                  />
                ))}
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-white/40 text-sm">
                2026 Rastremix - O Grupo Que Move o Brasil. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
