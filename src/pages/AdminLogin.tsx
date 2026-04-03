import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, Eye, EyeOff, Loader2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Logo3D } from '@/components/ui/Logo3D';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      const emailLower = trimmedEmail.toLowerCase();
      const result = await login({ email: emailLower, password: trimmedPassword });
      
      if (result.success) {
        toast.success(`Bem-vindo, ${result.user?.name}!`);
        
        const userRole = result.user?.role;
        if (userRole === 'tecnico' || userRole === 'user') {
          navigate('/tec', { replace: true });
        } else {
          navigate('/admin?tab=clientes', { replace: true });
        }
      } else {
        setError(result.error || 'Credenciais inválidas');
        toast.error(result.error || 'Credenciais inválidas');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      toast.error(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@rastremix.com');
    setPassword('Rastremix2024!');
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#FF6B00] via-[#FF4500] to-[#FF0000] items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <Logo3D size={280} animated={true} glowColor="white" />
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-4xl font-bold text-white"
          >
            RASTREMIX
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-xl text-white/80"
          >
            Segurança Veicular
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-2 text-white/60"
          >
            Proteção 24 horas para seu veículo
          </motion.p>
        </motion.div>

        <div className="absolute bottom-8 left-8 right-8 text-center">
          <p className="text-white/50 text-sm">
            © 2024 Rastremix. Todos os direitos reservados.
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[#0A0A0B] p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo3D size={140} animated={true} glowColor="primary" />
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              Área Restrita
            </h1>
            <p className="mt-2 text-white/50">
              Digite suas credenciais para acessar o sistema
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">E-mail</label>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-primary" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-14 border-white/10 bg-white/5 pl-12 text-base text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  autoFocus
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Senha</label>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-primary" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 border-white/10 bg-white/5 pl-12 pr-12 text-base text-white placeholder:text-white/20 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-14 w-full text-lg font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF4500] hover:opacity-90 text-white rounded-xl transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="mt-4 text-center">
              <button 
                type="button"
                onClick={fillDemo}
                className="text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          </form>

          <div className="mt-10 pt-6 border-t border-white/10 text-center">
            <p className="text-white/30 text-sm">
              © 2024 Rastremix Segurança Veicular
            </p>
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/')}
              className="text-sm font-medium text-white/30 hover:text-white/60 transition-colors"
            >
              ← Voltar para o início
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
