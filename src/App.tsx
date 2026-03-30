// Lovable Sync - Version 2.6 - 2026-03-30 12:05
import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { AgentProvider } from "@/agents/context/AgentContext";
import { ProtectedRoute, GuestRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import CRMPage from "./pages/crm/CRMPage";
import NotFound from "./pages/NotFound";
import PlansPage from "./pages/crm/PlansPage";
import LearningPage from "./pages/crm/LearningPage";

import DashboardPage from "./pages/modules/DashboardPage";
import TECPage from "./pages/modules/TECPage";
import ERPPage from "./pages/modules/ERPPage";
import SHELLPage from "./pages/modules/SHELLPage";
import TECAdminPage from "./pages/modules/TECAdminPage";
import TechniciansPage from "./pages/modules/TechniciansPage";
import CRMAgentsPage from "./pages/modules/CRMAgentsPage";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Algo deu errado ⚠️</h1>
            <p className="text-muted-foreground mb-6">{this.state.error?.message || 'Erro desconhecido'}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-primary text-white"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/planos" element={<PlansPage />} />
        <Route path="/aprenda" element={<LearningPage />} />
        
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />

        <Route
          path="/admin/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tecnico"
          element={
            <ProtectedRoute allowedRoles={['admin', 'tecnico', 'technician']}>
              <TECPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'tecnico', 'technician']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/crm"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CRMPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/crm/tecnicos"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TechniciansPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/crm/agentes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CRMAgentsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tec"
          element={
            <ProtectedRoute allowedRoles={['admin', 'tecnico', 'technician']}>
              <TECPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/tec/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TECAdminPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/erp"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ERPPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/shell"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SHELLPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <AgentProvider autoStart={false}>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AgentProvider>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
