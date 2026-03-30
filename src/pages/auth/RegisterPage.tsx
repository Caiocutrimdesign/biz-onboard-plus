import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User as UserIcon, Phone, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Logo3D } from '@/components/ui/Logo3D';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState<'admin' | 'tecnico'>('tecnico');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { cadastrarUsuario } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    try {
      const result = await cadastrarUsuario({
        name,
        email: email.toLowerCase().trim(),
        password,
        tipo,
      });

      if (result.success) {
        toast.success('Conta criada com sucesso!');
        navigate(tipo === 'admin' ? '/admin' : '/tecnico');
      } else {
        setError(result.error || 'Erro ao criar conta');
        toast.error(result.error || 'Erro ao criar conta');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dark p-4 relative overflow-hidden">
      {/* Background elements */}
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
            <Logo3D size={120} animated={true} glowColor="primary" />
          </div>
          
          <h1 className="font-display text-2xl font-bold tracking-tight text-surface-dark-foreground">
            Criar Nova Conta
          </h1>
          <p className="mt-2 text-center text-sm text-surface-dark-foreground/50">
            Preencha os dados abaixo para começar
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="group relative">
            <UserIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-dark-foreground/30 transition-colors group-focus-within:text-primary" />
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              className="h-12 border-surface-dark-foreground/10 bg-surface-dark-foreground/5 pl-12 text-surface-dark-foreground placeholder:text-surface-dark-foreground/20 focus:border-primary/50 focus:ring-primary/20"
              required
              disabled={isLoading}
            />
          </div>

          <div className="group relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-dark-foreground/30 transition-colors group-focus-within:text-primary" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="h-12 border-surface-dark-foreground/10 bg-surface-dark-foreground/5 pl-12 text-surface-dark-foreground placeholder:text-surface-dark-foreground/20 focus:border-primary/50 focus:ring-primary/20"
              required
              disabled={isLoading}
            />
          </div>

          <div className="group relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-dark-foreground/30 transition-colors group-focus-within:text-primary" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="h-12 border-surface-dark-foreground/10 bg-surface-dark-foreground/5 pl-12 text-surface-dark-foreground placeholder:text-surface-dark-foreground/20 focus:border-primary/50 focus:ring-primary/20"
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              type="button"
              onClick={() => setTipo('admin')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                tipo === 'admin' 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-surface-dark-foreground/5 border-surface-dark-foreground/10 text-surface-dark-foreground/50 hover:bg-surface-dark-foreground/10'
              }`}
            >
              <Shield className="w-4 h-4" />
              Administrador
            </button>
            <button
              type="button"
              onClick={() => setTipo('tecnico')}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                tipo === 'tecnico' 
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-surface-dark-foreground/5 border-surface-dark-foreground/10 text-surface-dark-foreground/50 hover:bg-surface-dark-foreground/10'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Técnico
            </button>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-12 w-full mt-4 text-base font-bold bg-gradient-brand shadow-brand hover:opacity-90 transition-all active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Criar Conta
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-surface-dark-foreground/50">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Faça login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
