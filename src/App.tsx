import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AgentProvider } from "@/agents/context/AgentContext";
import { ProtectedRoute, GuestRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import CRMPage from "./pages/crm/CRMPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import PlansPage from "./pages/crm/PlansPage.tsx";
import LearningPage from "./pages/crm/LearningPage.tsx";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/planos" element={<PlansPage />} />
      <Route path="/aprenda" element={<LearningPage />} />
      
      <Route
        path="/admin/login"
        element={
          <GuestRoute>
            <AdminLogin />
          </GuestRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/crm/*"
        element={
          <ProtectedRoute allowedRoles={['admin', 'user']}>
            <CRMPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AgentProvider autoStart={true}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AgentProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
