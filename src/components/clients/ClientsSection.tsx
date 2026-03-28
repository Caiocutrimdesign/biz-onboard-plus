import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Eye, Plus, Car, Smartphone, Mail, MapPin,
  Sparkles, Zap, Heart, Star, ChevronRight, Users,
  TrendingUp, Shield, Activity, Clock, CheckCircle2, AlertCircle,
  User, CreditCard, Navigation, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { STATUS_LABELS, STATUS_COLORS, type CustomerRegistration, type CustomerStatus } from '@/types/customer';

const MOCK_CUSTOMERS: CustomerRegistration[] = [
  {
    id: '1', full_name: 'Carlos Silva', phone: '(11) 99999-1111', cpf_cnpj: '123.456.789-00',
    email: 'carlos@email.com', cep: '01001-000', street: 'Rua A', number: '100', neighborhood: 'Centro',
    city: 'São Paulo', state: 'SP', vehicle_type: 'carro', plate: 'ABC-1234', brand: 'Volkswagen',
    model: 'Gol', year: '2022', color: 'Prata', plan: 'completo', payment_method: 'pix',
    status: 'novo_cadastro', created_at: '2026-03-28T10:00:00Z',
  },
  {
    id: '2', full_name: 'Ana Oliveira', phone: '(21) 98888-2222', cpf_cnpj: '987.654.321-00',
    email: 'ana@email.com', cep: '20040-020', street: 'Rua B', number: '200', neighborhood: 'Copacabana',
    city: 'Rio de Janeiro', state: 'RJ', vehicle_type: 'moto', plate: 'DEF-5678', brand: 'Honda',
    model: 'CG 160', year: '2024', color: 'Vermelha', plan: 'bloqueio', payment_method: 'cartao',
    status: 'em_atendimento', created_at: '2026-03-27T14:30:00Z',
  },
  {
    id: '3', full_name: 'Roberto Santos', phone: '(31) 97777-3333', cpf_cnpj: '11.222.333/0001-44',
    email: 'roberto@empresa.com', cep: '30130-000', street: 'Av C', number: '300', neighborhood: 'Savassi',
    city: 'Belo Horizonte', state: 'MG', vehicle_type: 'frota', plate: 'GHI-9012', brand: 'Fiat',
    model: 'Strada', year: '2023', color: 'Branco', plan: 'frota', payment_method: 'boleto',
    status: 'cliente_ativado', created_at: '2026-03-25T09:15:00Z',
  },
  {
    id: '4', full_name: 'Marina Costa', phone: '(19) 96666-4444', cpf_cnpj: '555.666.777-88',
    email: 'marina.costa@gmail.com', cep: '13020-000', street: 'Rua D', number: '450', neighborhood: 'Cambui',
    city: 'Campinas', state: 'SP', vehicle_type: 'carro', plate: 'JKL-3456', brand: 'Toyota',
    model: 'Corolla', year: '2025', color: 'Preto', plan: 'completo', payment_method: 'pix',
    status: 'cliente_ativado', created_at: '2026-03-24T11:00:00Z',
  },
  {
    id: '5', full_name: 'Fernando Lima', phone: '(41) 95555-5555', cpf_cnpj: '222.333.444-55',
    email: 'fernando.lima@outlook.com', cep: '80010-000', street: 'Av Brasil', number: '1200', neighborhood: 'Centro',
    city: 'Curitiba', state: 'PR', vehicle_type: 'moto', plate: 'MNO-7890', brand: 'Yamaha',
    model: 'Fazer', year: '2023', color: 'Azul', plan: 'basico', payment_method: 'cartao',
    status: 'novo_cadastro', created_at: '2026-03-28T08:30:00Z',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, rotateY: 0, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' },
  hover: {
    scale: 1.02,
    rotateY: 2,
    boxShadow: '0 25px 60px -15px rgba(0,0,0,0.2)',
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-primary/30 to-primary/10 pointer-events-none"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -20, 0],
      opacity: [0.3, 0.7, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: 3 + delay,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  />
);

const Avatar3D = ({ name, status }: { name: string; status: CustomerStatus }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = [
    'from-red-400 to-pink-500',
    'from-blue-400 to-cyan-500',
    'from-green-400 to-emerald-500',
    'from-purple-400 to-violet-500',
    'from-orange-400 to-amber-500',
    'from-indigo-400 to-blue-500',
  ];
  const colorIndex = name.length % colors.length;
  const statusColors: Record<CustomerStatus, string> = {
    novo_cadastro: 'bg-warning',
    em_atendimento: 'bg-blue-500',
    documento_pendente: 'bg-orange-500',
    aguardando_pagamento: 'bg-purple-500',
    cliente_ativado: 'bg-green-500',
    cliente_bloqueado: 'bg-red-500',
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.1, rotateY: 10 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center shadow-lg overflow-hidden`}>
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
        <span className="relative font-display font-black text-white text-lg">{initials}</span>
        <motion.div
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${statusColors[status]} border-2 border-white`}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend: string;
  color: string;
}) => (
  <motion.div
    className="relative group"
    variants={cardHoverVariants}
    initial="rest"
    whileHover="hover"
  >
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 shadow-elegant">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
      <div className="relative">
        <motion.div
          className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 shadow-lg`}
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <div className="flex items-end gap-3">
          <p className="font-display text-3xl font-black">{value}</p>
          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none text-xs font-bold">
            <TrendingUp className="w-3 h-3 mr-1" /> {trend}
          </Badge>
        </div>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-transparent"
        initial={{ width: '0%' }}
        whileInView={{ width: '100%' }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  </motion.div>
);

const ClientCard = ({ customer, onView }: { customer: CustomerRegistration; onView: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
    >
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-elegant transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar3D name={customer.full_name} status={customer.status} />
              <div>
                <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  {customer.full_name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> {customer.phone}
                </p>
              </div>
            </div>
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
            >
              <Badge className={`${STATUS_COLORS[customer.status]} border-none rounded-full px-3`}>
                {STATUS_LABELS[customer.status]}
              </Badge>
            </motion.div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 group-hover:bg-primary/5 transition-colors">
              <motion.div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                animate={isHovered ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Car className="w-5 h-5 text-primary" />
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{customer.brand} {customer.model}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{customer.plate}</p>
              </div>
              <Badge variant="outline" className="capitalize text-xs">{customer.plan}</Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(customer.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <motion.div
                className="flex items-center gap-1 text-primary font-semibold text-sm"
                initial={{ x: 0 }}
                animate={{ x: isHovered ? 4 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Ver detalhes <ChevronRight className="w-4 h-4" />
              </motion.div>
            </div>
          </div>

          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: 'left' }}
          />
        </div>

        {[...Array(3)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.5}
            x={`${20 + i * 30}%`}
            y={`${60 + i * 10}%`}
            size={4 + i * 2}
          />
        ))}
      </div>
    </motion.div>
  );
};

const DetailModal = ({ customer, open, onClose }: { customer: CustomerRegistration | null; open: boolean; onClose: () => void }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl rounded-3xl border-none p-0 overflow-hidden bg-card shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            
            <div className="relative p-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="relative"
                  >
                    <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                      <span className="font-display font-black text-3xl">
                        {customer?.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div>
                    <Badge className="bg-white/20 hover:bg-white/30 border-none text-white mb-2 uppercase text-[10px] tracking-widest font-bold">
                      Ficha do Cliente
                    </Badge>
                    <DialogTitle className="font-display text-3xl font-black mb-1">
                      {customer?.full_name}
                    </DialogTitle>
                    <div className="flex items-center gap-4 text-white/70 text-sm">
                      <span className="flex items-center gap-1">
                        <Smartphone className="w-4 h-4" /> {customer?.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {customer?.email}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className={`${customer ? STATUS_COLORS[customer.status] : ''} border-none text-white rounded-full px-4`}>
                  {customer ? STATUS_LABELS[customer.status] : ''}
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-8 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <User className="w-4 h-4" /> Informações Pessoais
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">CPF / CNPJ</p>
                    <p className="font-bold">{customer?.cpf_cnpj}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">E-mail</p>
                    <p className="font-bold text-sm">{customer?.email}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Endereço Completo
                </h3>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50 space-y-2 text-sm">
                  <p className="font-semibold">{customer?.street}, {customer?.number}</p>
                  <p className="text-muted-foreground">{customer?.neighborhood}</p>
                  <p className="text-muted-foreground">{customer?.city} / {customer?.state}</p>
                  <p className="text-muted-foreground text-xs">CEP: {customer?.cep}</p>
                </div>
              </motion.div>
            </div>

            <motion.div
              className="rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 p-6 border border-border/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Car className="w-4 h-4" /> Dados do Veículo & Plano
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <motion.div
                  className="text-center p-4 rounded-2xl bg-white shadow-sm border border-border/30"
                  whileHover={{ y: -4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 mx-auto mb-3 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Veículo</p>
                  <p className="font-bold text-sm">{customer?.brand}</p>
                  <p className="text-xs text-muted-foreground">{customer?.model}</p>
                </motion.div>

                <motion.div
                  className="text-center p-4 rounded-2xl bg-white shadow-sm border border-border/30"
                  whileHover={{ y: -4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 mx-auto mb-3 flex items-center justify-center">
                    <span className="font-display font-black text-primary text-lg">
                      {customer?.plate.substring(0, 3)}
                    </span>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Placa</p>
                  <p className="font-bold text-sm uppercase tracking-widest">{customer?.plate}</p>
                </motion.div>

                <motion.div
                  className="text-center p-4 rounded-2xl bg-white shadow-sm border border-border/30"
                  whileHover={{ y: -4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/10 mx-auto mb-3 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Plano</p>
                  <p className="font-bold capitalize">{customer?.plan}</p>
                </motion.div>

                <motion.div
                  className="text-center p-4 rounded-2xl bg-white shadow-sm border border-border/30"
                  whileHover={{ y: -4, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 mx-auto mb-3 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Pagamento</p>
                  <p className="font-bold capitalize">{customer?.payment_method}</p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="flex gap-4 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button className="flex-1 bg-gradient-brand h-14 rounded-2xl font-bold shadow-brand hover:shadow-xl transition-all group">
                <CheckCircle2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Ativar Cliente
              </Button>
              <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold border-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive">
                <AlertCircle className="w-5 h-5 mr-2" />
                Reprovar
              </Button>
              <Button variant="ghost" className="h-14 rounded-2xl font-bold px-8 hover:bg-primary/5 hover:text-primary transition-colors">
                Editar
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default function ClientsSection() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRegistration | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter((c) => {
      const matchSearch = !search || [c.full_name, c.phone, c.plate, c.cpf_cnpj, c.email]
        .some((f) => f?.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => ({
    total: MOCK_CUSTOMERS.length,
    active: MOCK_CUSTOMERS.filter(c => c.status === 'cliente_ativado').length,
    pending: MOCK_CUSTOMERS.filter(c => c.status === 'novo_cadastro').length,
    inProgress: MOCK_CUSTOMERS.filter(c => c.status === 'em_atendimento').length,
  }), []);

  return (
    <div className="space-y-8">
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-8 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <motion.div
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Users className="w-5 h-5" />
            </motion.div>
            <span className="text-white/60 text-sm font-medium">Gestão de Clientes</span>
          </div>
          <h1 className="font-display text-4xl font-black mb-2">
            Nossos Clientes
          </h1>
          <p className="text-white/70 text-lg max-w-xl">
            Gerencie todos os clientes da Rastremix com uma experiência moderna e intuitiva.
          </p>

          <div className="flex items-center gap-6 mt-6">
            {[
              { label: 'Total', value: stats.total, icon: Users },
              { label: 'Ativos', value: stats.active, icon: CheckCircle2 },
              { label: 'Pendentes', value: stats.pending, icon: Clock },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <s.icon className="w-5 h-5 text-white/70" />
                <div>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-xs text-white/60">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {[...Array(5)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.3}
            x={`${10 + i * 20}%`}
            y={`${20 + i * 15}%`}
            size={6 + i * 2}
          />
        ))}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatCard
          icon={Users}
          label="Total de Clientes"
          value={stats.total}
          trend="+12%"
          color="bg-gradient-to-br from-primary to-primary/70"
        />
        <StatCard
          icon={CheckCircle2}
          label="Clientes Ativos"
          value={stats.active}
          trend="+8%"
          color="bg-gradient-to-br from-green-500 to-emerald-500"
        />
        <StatCard
          icon={Clock}
          label="Em Atendimento"
          value={stats.inProgress}
          trend="+5%"
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={AlertCircle}
          label="Novos Cadastros"
          value={stats.pending}
          trend="+15%"
          color="bg-gradient-to-br from-orange-500 to-amber-500"
        />
      </motion.div>

      <motion.div
        className="flex flex-col gap-4 sm:flex-row items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="relative w-full sm:w-96">
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2"
            whileHover={{ scale: 1.1 }}
          >
            <Search className="h-5 w-5 text-muted-foreground" />
          </motion.div>
          <Input
            placeholder="Buscar por nome, telefone, placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-14 pl-12 rounded-2xl bg-card border-border/50 text-base focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-14 w-full sm:w-52 rounded-2xl bg-card border-border/50">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-gradient-brand h-14 rounded-2xl px-8 font-bold shadow-brand hover:shadow-xl transition-all group">
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            Novo Cliente
          </Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {filteredCustomers.length > 0 ? (
          <motion.div
            key="grid"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {filteredCustomers.map((customer) => (
              <ClientCard
                key={customer.id}
                customer={customer}
                onView={() => {
                  setSelectedCustomer(customer);
                  setDetailOpen(true);
                }}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="flex flex-col items-center justify-center py-20 rounded-3xl bg-muted/20 border-2 border-dashed border-border/50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-12 h-12 text-primary" />
            </motion.div>
            <h3 className="font-display text-2xl font-bold mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Não encontramos nenhum cliente com os critérios buscados. Tente ajustar seus filtros ou adicione um novo cliente.
            </p>
            <Button className="bg-gradient-brand h-12 rounded-xl px-8 font-bold">
              <Plus className="w-5 h-5 mr-2" /> Adicionar Cliente
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <DetailModal
        customer={selectedCustomer}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
