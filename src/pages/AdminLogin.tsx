import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import logo from '@/assets/logo-rastremix.png';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Teste123') {
      sessionStorage.setItem('admin_auth', 'true');
      toast.success('Acesso concedido');
      navigate('/admin');
    } else {
      toast.error('Senha incorreta');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dark p-4">
      <div className="absolute inset-0 z-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-50" />
      
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-surface-dark-foreground/10 bg-surface-dark/40 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-10 flex flex-col items-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-sm">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <img src={logo} alt="Rastremix" className="mb-4 h-10 w-auto opacity-80" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-surface-dark-foreground">Acesso Restrito</h1>
          <p className="mt-2 text-center text-sm text-surface-dark-foreground/50">Insira a chave de segurança para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="group relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-dark-foreground/30 transition-colors group-focus-within:text-primary" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de acesso"
              className="h-14 border-surface-dark-foreground/10 bg-surface-dark-foreground/5 pl-12 text-lg text-surface-dark-foreground placeholder:text-surface-dark-foreground/20 focus:border-primary/50 focus:ring-primary/20"
              autoFocus
            />
          </div>
          
          <Button 
            type="submit" 
            className="group bg-gradient-brand shadow-brand h-14 w-full text-lg font-bold text-primary-foreground transition-all active:scale-95"
          >
            Acessar Sistema
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
      </div>
    </div>
  );
}

