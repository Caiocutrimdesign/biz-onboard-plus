import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import logo from '@/assets/logo-rastremix.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Temporary local auth — will be replaced with Supabase auth
    if (email === 'admin@rastremix.com' && password === 'admin123') {
      sessionStorage.setItem('admin_auth', 'true');
      navigate('/admin');
    } else {
      toast.error('Credenciais inválidas');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <div className="mb-8 flex flex-col items-center">
          <img src={logo} alt="Rastremix" className="mb-4 h-12" />
          <h1 className="font-display text-2xl font-bold">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acesse com suas credenciais</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="admin-email">E-mail</Label>
            <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@rastremix.com" className="mt-1 h-12" />
          </div>
          <div>
            <Label htmlFor="admin-password">Senha</Label>
            <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1 h-12" />
          </div>
          <Button type="submit" className="bg-gradient-brand h-12 w-full text-base font-semibold text-primary-foreground">
            <LogIn className="mr-2 h-4 w-4" />
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
