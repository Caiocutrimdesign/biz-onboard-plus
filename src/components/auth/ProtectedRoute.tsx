import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'tecnico' | 'user')[];
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'tecnico', 'user'] 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    }

    if (!isLoading && isAuthenticated && user && allowedRoles) {
      // Check if user has one of the allowed roles (tipo)
      const userRole = user.tipo || user.role;
      if (!allowedRoles.includes(userRole as any)) {
        // Redirection based on role if access denied
        if (userRole === 'tecnico') {
          navigate('/tecnico', { replace: true });
        } else if (userRole === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will navigate in useEffect
  }

  // Check role again for rendering
  const userRole = user?.tipo || user?.role;
  if (allowedRoles && !allowedRoles.includes(userRole as any)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const userRole = user.tipo || user.role;
      let redirectTo = '/admin';
      if (userRole === 'tecnico') {
        redirectTo = '/tecnico';
      }
      navigate(redirectTo, { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : null;
}

export default ProtectedRoute;
