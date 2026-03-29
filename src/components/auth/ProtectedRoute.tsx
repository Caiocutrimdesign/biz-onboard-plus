import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'user' | 'viewer' | 'technician' | 'employee')[];
}

export function ProtectedRoute({ 
  children, 
  allowedRoles = ['admin', 'user', 'viewer', 'technician', 'employee'] 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sessionData = localStorage.getItem('biz_crm_session');
    
    if (!sessionData) {
      navigate('/admin/login', { 
        state: { from: location.pathname },
        replace: true 
      });
      return;
    }

    try {
      const session = JSON.parse(sessionData);
      const user = session.user;
      
      if (!user) {
        navigate('/admin/login', { 
          state: { from: location.pathname },
          replace: true 
        });
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        navigate('/', { replace: true });
      }
    } catch (e) {
      localStorage.removeItem('biz_crm_session');
      navigate('/admin/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [navigate, location, allowedRoles]);

  const sessionData = localStorage.getItem('biz_crm_session');
  
  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  try {
    const session = JSON.parse(sessionData);
    const user = session.user;
    
    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
          </div>
        </div>
      );
    }
  } catch (e) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sessionData = localStorage.getItem('biz_crm_session');
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.user) {
          const from = (location.state as any)?.from || '/admin';
          navigate(from, { replace: true });
        }
      } catch (e) {
        localStorage.removeItem('biz_crm_session');
      }
    }
  }, [navigate, location]);

  return <>{children}</>;
}

export default ProtectedRoute;
