import { useEffect } from 'react';
import CRMLayout from '@/components/crm/CRMLayout';
import CRMDashboard from '@/components/crm/dashboard/CRMDashboard';
import Pipeline from '@/components/crm/pipeline/Pipeline';
import LeadsList from '@/components/crm/leads/LeadsList';
import AutomationList from '@/components/crm/automation/AutomationList';
import EmailList from '@/components/crm/email/EmailList';
import CalendarView from '@/components/crm/calendar/CalendarView';
import AnalyticsView from '@/components/crm/analytics/AnalyticsView';
import FunnelsView from '@/components/crm/FunnelsView';
import SettingsView from '@/components/crm/SettingsView';
import { AgentPanel } from '@/components/agents/AgentPanel';
import { SatisfactionSection } from '@/components/clients/SatisfactionSection';
import UsersPage from './UsersPage';
import { CRMProvider, useCRMContext } from '@/contexts/CRMContext';

function CRMContent() {
  const { activeModule } = useCRMContext();

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <CRMDashboard />;
      case 'leads':
        return <LeadsList />;
      case 'pipeline':
        return <Pipeline />;
      case 'automation':
        return <AutomationList />;
      case 'email':
        return <EmailList />;
      case 'calendar':
        return <CalendarView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'funnels':
        return <FunnelsView />;
      case 'satisfaction':
        return <SatisfactionSection />;
      case 'users':
        return <UsersPage />;
      case 'agents':
        return <AgentPanel />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CRMDashboard />;
    }
  };

  return (
    <CRMLayout>
      {renderModule()}
    </CRMLayout>
  );
}

export default function CRMPage() {
  return (
    <CRMProvider>
      <CRMContent />
    </CRMProvider>
  );
}
