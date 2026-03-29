import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, Eye, EyeOff, Loader2, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Logo3D } from '@/components/ui/Logo3D';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const supabaseConfigured = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      const result = await login({ email: email.trim(), password });
      
      if (result.success) {
        toast.success(`Bem-vindo, ${result.user?.name}!`);
        const from = (location.state as any)?.from || '/admin';
        navigate(from, { replace: true });
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dark p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-surface-dark-foreground/10 bg-surface-dark/40 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6">
            <Logo3D size={160} animated={true} glowColor="primary" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-surface-dark-foreground">
            Acesso Restrito
          </h1>
          <p className="mt-2 text-center text-sm text-surface-dark-foreground/50">
            Entre com suas credenciais para acessar o sistema
          </p>
        </div>

        {!supabaseConfigured && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-500">Modo Demo</p>
                <p className="text-xs text-amber-500/70 mt-1">
                  Use: <strong>admin@rastremix.com</strong> / <strong>Rastremix2024!</strong>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-dark-foreground/30 transition-colors group-focus-within:text-primary" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="h-14 border-surface-dark-foreground/10 bg-surface-dark-foreground/5 pl-12 text-base text-surface-dark-foreground placeholder:text-surface-dark-foreground/20 focus:border-primary/50 focus:ring-primary/20"
              autoFocus
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="group relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-dark-foreground/30 transition-colors group-focus-within:text-primary" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="h-14 border-surface-dark-foreground/10 bg-surface-dark-foreground/5 pl-12 pr-12 text-base text-surface-dark-foreground placeholder:text-surface-dark-foreground/20 focus:border-primary/50 focus:ring-primary/20"
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-dark-foreground/30 hover:text-surface-dark-foreground/60 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading}
            className="group bg-gradient-brand shadow-brand h-14 w-full text-lg font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Acessar Sistema
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-xs font-medium text-surface-dark-foreground/30 transition-colors hover:text-surface-dark-foreground/60"
          >
            Voltar para o início
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-surface-dark-foreground/10">
          <p className="text-center text-xs text-surface-dark-foreground/30">
            Protegido por criptografia de ponta a ponta
          </p>
        </div>
      </motion.div>
    </div>
  );
}
