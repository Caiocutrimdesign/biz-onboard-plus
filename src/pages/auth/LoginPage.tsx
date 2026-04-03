import { useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Shield, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Logo3D } from '@/components/ui/Logo3D';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUsuario } = useAuth();

  const from = location.state?.from || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginUsuario({
        email: email.toLowerCase().trim(),
        password: password.trim(),
      });

      if (result.success) {
        toast.success(`Bem-vindo, ${result.user?.name}!`);
        
        const role = result.user?.tipo || result.user?.role;
        if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (role === 'tecnico') {
          navigate('/tecnico', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setError(result.error || 'Credenciais inválidas');
        toast.error(result.error || 'Credenciais inválidas');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate random points for the tracking grid
  const trackingPoints = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      left: `${Math.random() * 80 + 10}%`,
      top: `${Math.random() * 80 + 10}%`,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0A0A0B] overflow-hidden selection:bg-primary/30">
      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] w-full min-h-screen">
        
        {/* Left Section: Form with Glassmorphism */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative z-20 flex flex-col justify-center px-8 sm:px-12 bg-white/[0.03] backdrop-blur-3xl border-r border-white/5"
        >
          {/* Internal Glow */}
          <div className="absolute top-0 left-0 w-full h-[30%] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
          
          <div className="max-w-md w-full mx-auto relative">
            <div className="mb-10 flex flex-col items-center lg:items-start">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="mb-8 p-4 rounded-3xl bg-gradient-brand shadow-brand"
              >
                <Shield className="w-12 h-12 text-white" />
              </motion.div>
              
              <h1 className="font-display text-3xl font-bold tracking-tight text-white text-center lg:text-left">
                Acesso Restrito
              </h1>
              <p className="mt-2 text-center lg:text-left text-sm text-white/50 font-medium">
                Sistemas de Inteligência e Monitoramento RASTREMIX
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">E-mail Corporativo</label>
                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-primary" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: admin@rastremix.com.br"
                    className="h-14 border-white/5 bg-white/5 pl-12 text-base text-white placeholder:text-white/10 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Senha Segura</label>
                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/20 transition-colors group-focus-within:text-primary" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 border-white/5 bg-white/5 pl-12 pr-12 text-base text-white placeholder:text-white/10 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors p-2"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mb-2">
                <Link to="#" className="text-xs font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-tight">
                  Esqueci minha senha
                </Link>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-14 w-full text-lg font-bold bg-gradient-brand shadow-brand hover:opacity-90 transition-all active:scale-[0.98] rounded-2xl mt-4"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Iniciar Monitoramento
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-4 items-center">
              <p className="text-xs text-white/30 font-medium tracking-tight">
                Ambiente de segurança restrita. IP logado.
              </p>
              
              <Link to="/" className="group flex items-center gap-2 text-sm font-bold text-white/40 hover:text-white transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-primary transition-colors" />
                Voltar ao Início
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Section: Animated Tracking Grid */}
        <div className="hidden lg:block relative overflow-hidden bg-[#0A0A0B]">
          {/* Animated Map Grid */}
          <div className="absolute inset-0 z-0">
            {/* Base Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-blue-500/10 mix-blend-overlay" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:40px_40px] animate-grid-flow" />
            
            {/* Animated Tracking Points */}
            {trackingPoints.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 1, 0.1] }}
                transition={{ 
                  duration: p.duration, 
                  repeat: Infinity, 
                  delay: p.delay 
                }}
                className="absolute w-4 h-4"
                style={{ left: p.left, top: p.top }}
              >
                <div className="absolute inset-0 bg-primary/40 rounded-full blur-md" />
                <div className="w-2 h-2 bg-primary rounded-full relative z-10 mx-auto mt-1 shadow-[0_0_10px_#ff0000]" />
                
                {/* Movement Tail (Diagonal) */}
                <motion.div 
                  className="absolute top-1/2 left-3 h-[1px] w-12 bg-gradient-to-r from-primary to-transparent"
                  animate={{ width: [0, 60, 0], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: p.delay }}
                />
              </motion.div>
            ))}

            {/* Scanning Effect */}
            <motion.div 
              animate={{ top: ['-10%', '110%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent shadow-[0_0_15px_rgba(255,0,0,0.2)]"
            />
          </div>

          {/* Floating UI Elements */}
          <div className="absolute top-12 right-12 z-10 flex flex-col gap-6 items-end">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark p-6 rounded-3xl border border-white/10 flex items-center gap-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Navigation className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Sytem Status</p>
                <p className="text-xl font-display font-bold text-white leading-none">ALL AGENTS ACTIVE</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-dark p-6 rounded-3xl border border-white/10 flex items-center gap-4 shadow-2xl"
            >
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/40">Active Connections</p>
                <p className="text-3xl font-display font-bold text-primary leading-none">1,248</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </motion.div>
          </div>

          {/* Bottom Branding */}
          <div className="absolute bottom-12 left-12 right-12 z-10 flex justify-between items-end">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-2">
                 <Logo3D size={48} animated={true} />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40 tracking-tighter">GLOBAL OPS</h2>
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Advanced Tracking v4.0</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-xs font-mono text-white/20">LAT: -23.5505 | LON: -46.6333</p>
              <p className="text-xs font-mono text-white/20">SECURITY PROTOCOL: RSA-4096</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
