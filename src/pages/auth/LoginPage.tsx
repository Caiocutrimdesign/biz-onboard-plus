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
    <div className="flex min-h-screen bg-white overflow-hidden selection:bg-blue-100">
      {/* Split Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] w-full min-h-screen">
        
        {/* Left Section: Content with Premium White Card */}
        <motion.div 
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative z-20 flex flex-col justify-center px-10 sm:px-16 bg-gray-50/50 border-r border-gray-100"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none" />
          
          <div className="max-w-md w-full mx-auto relative">
            <div className="mb-12 flex flex-col items-center lg:items-start">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="mb-10 p-5 rounded-[2rem] bg-blue-600 shadow-xl shadow-blue-200"
              >
                <Shield className="w-14 h-14 text-white" />
              </motion.div>
              
              <h1 className="font-display text-4xl font-black tracking-tight text-gray-900 text-center lg:text-left leading-tight">
                Portal de <span className="text-blue-600">Segurança</span>
              </h1>
              <p className="mt-3 text-center lg:text-left text-xs font-black uppercase tracking-[0.3em] text-gray-400">
                Sistemas de Monitoramento RASTREMIX
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 rounded-3xl bg-red-50 border border-red-100 flex items-center gap-4 text-red-600 text-sm font-bold"
              >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                </div>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">E-mail Corporativo</label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center transition-colors group-focus-within:bg-blue-50 group-focus-within:text-blue-600 text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: gestao@rastremix.com.br"
                    className="h-16 border-gray-100 bg-white pl-16 text-base text-gray-900 placeholder:text-gray-300 rounded-2xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Senha de Acesso</label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center transition-colors group-focus-within:bg-blue-50 group-focus-within:text-blue-600 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-16 border-gray-100 bg-white pl-16 pr-12 text-base text-gray-900 placeholder:text-gray-300 rounded-2xl shadow-sm focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-600 transition-colors p-2"
                  >
                    {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Link to="#" className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest hover:underline">
                  Esqueci minha senha
                </Link>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="h-16 w-full text-base font-black bg-blue-600 shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] rounded-2xl mt-6 uppercase tracking-widest"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <span className="flex items-center gap-3">
                    Acessar Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col gap-6 items-center lg:items-start">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Ambiente de segurança restrito
                </p>
              </div>
              
              <Link to="/" className="group flex items-center gap-3 text-sm font-black text-gray-400 hover:text-blue-600 transition-all">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center group-hover:bg-blue-50 group-hover:border-blue-200 transition-all shadow-sm">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </div>
                Voltar ao Início
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Section: Light Animated Tracking Grid */}
        <div className="hidden lg:block relative overflow-hidden bg-white">
          {/* Animated Map Grid */}
          <div className="absolute inset-0 z-0">
            {/* Soft Ambient Radiance */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-white to-orange-50/30" />
            
            {/* Grid Pattern (Light) */}
            <div className="absolute inset-0 opacity-[0.4] bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:50px_50px]" />
            
            {/* Animated Tracking Points (Light Theme) */}
            {trackingPoints.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ 
                  duration: p.duration, 
                  repeat: Infinity, 
                  delay: p.delay 
                }}
                className="absolute w-6 h-6"
                style={{ left: p.left, top: p.top }}
              >
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl scale-150" />
                <div className="w-3 h-3 bg-blue-500 rounded-full relative z-10 mx-auto mt-1.5 shadow-[0_4px_12px_rgba(59,130,246,0.5)] border-2 border-white" />
                
                {/* Movement Tail */}
                <motion.div 
                  className="absolute top-1/2 left-4 h-0.5 w-16 bg-gradient-to-r from-blue-500/30 to-transparent"
                  animate={{ width: [0, 80, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
                />
              </motion.div>
            ))}

            {/* Light Scanning Beam */}
            <motion.div 
              animate={{ top: ['-20%', '120%'] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-2 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent"
            />
          </div>

          {/* Floating High-Contrast UI Elements */}
          <div className="absolute top-16 right-16 z-10 flex flex-col gap-8 items-end">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl flex items-center gap-6"
            >
              <div className="w-16 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Navigation className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 mb-1">Status do Centro de Comando</p>
                <p className="text-2xl font-display font-black text-gray-900 leading-none">AGENTES EM CAMPO</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl flex items-center gap-6"
            >
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-400 mb-1">Conexões Ativas</p>
                <p className="text-4xl font-display font-black text-blue-600 leading-none tracking-tighter">1.248</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </motion.div>
          </div>

          {/* Bottom Corporate Branding */}
          <div className="absolute bottom-16 left-16 right-16 z-10 flex justify-between items-end">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-white/80 backdrop-blur-2xl border border-white shadow-2xl p-3 flex items-center justify-center">
                 <Logo3D size={56} animated={true} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-1 uppercase">Rastremix <span className="text-blue-600">Ops</span></h2>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.4em]">Integração Global v4.2</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-black text-gray-300 tracking-tighter mb-1 uppercase">SÃO LUÍS - MA | BRASIL</p>
              <p className="text-[10px] font-black text-gray-300 tracking-widest uppercase">RSA-4096 ENCRYPTED ENVIRONMENT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
