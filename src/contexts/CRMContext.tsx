import { createContext, useContext, useState, type ReactNode } from 'react';

type CRMLodule = 'dashboard' | 'leads' | 'pipeline' | 'automation' | 'email' | 'calendar' | 'analytics' | 'funnels' | 'agents' | 'settings' | 'satisfaction' | 'users';

interface CRMContextValue {
  activeModule: CRMLodule;
  setActiveModule: (module: CRMLodule) => void;
}

const CRMContext = createContext<CRMContextValue | null>(null);

export function CRMProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModule] = useState<CRMLodule>('dashboard');

  return (
    <CRMContext.Provider value={{ activeModule, setActiveModule }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRMContext() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRMContext must be used within a CRMProvider');
  }
  return context;
}

export type { CRMLodule };
