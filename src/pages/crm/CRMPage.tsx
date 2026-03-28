import { useState } from 'react';
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

type CRMLodule = 'dashboard' | 'leads' | 'pipeline' | 'automation' | 'email' | 'calendar' | 'analytics' | 'funnels' | 'settings';

export default function CRMPage() {
  const [activeModule, setActiveModule] = useState<CRMLodule>('dashboard');

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
      case 'settings':
        return <SettingsView />;
      default:
        return <CRMDashboard />;
    }
  };

  return (
    <CRMLayout activeModule={activeModule} setActiveModule={setActiveModule}>
      {renderModule()}
    </CRMLayout>
  );
}
