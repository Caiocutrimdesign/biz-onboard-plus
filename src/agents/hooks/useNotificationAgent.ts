import { useState, useCallback, useEffect } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import type { Notification } from '@/agents/types';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'follow_up' | 'reminder' | 'alert' | 'birthday' | 'renewal' | 'custom';
  subject?: string;
  message: string;
  delay?: number;
}

const TEMPLATES: NotificationTemplate[] = [
  {
    id: 'welcome',
    name: 'Bem-vindo',
    type: 'custom',
    subject: 'Bem-vindo à Rastremix! 🚗',
    message: 'Olá {name}! Seja muito bem-vindo à Rastremix. Seu veículo está protegido 24h. Em caso de emergência, ligue: 0800 000 0000.',
  },
  {
    id: 'follow_up_1',
    name: 'Follow-up Dia 1',
    type: 'follow_up',
    subject: 'Como está sendo sua experiência?',
    message: 'Olá {name}! Tudo bem? Quero saber como está sendo sua experiência com a Rastremix. Precisa de alguma ajuda?',
    delay: 1,
  },
  {
    id: 'follow_up_3',
    name: 'Follow-up Dia 3',
    type: 'follow_up',
    subject: 'Tem alguma dúvida?',
    message: 'Olá {name}! Passamos aqui para ver se está tudo ok. Se tiver qualquer dúvida sobre o rastreamento, estou à disposição!',
    delay: 3,
  },
  {
    id: 'follow_up_7',
    name: 'Follow-up Dia 7',
    type: 'follow_up',
    subject: 'Avalie-nos! ⭐',
    message: 'Olá {name}! Já faz uma semana que você conheceu a Rastremix. Gostaria de saber sua opinião sobre nosso atendimento!',
    delay: 7,
  },
  {
    id: 'reminder_install',
    name: 'Lembrete Instalação',
    type: 'reminder',
    subject: 'Lembrete: Agendamento de Instalação',
    message: 'Olá {name}! Lembramos que sua instalação está agendada para {date}. Por favor, certifique-se de que o veículo estará disponível.',
  },
  {
    id: 'birthday',
    name: 'Aniversário',
    type: 'birthday',
    subject: '🎂 Parabéns, {name}!',
    message: 'Olá {name}! A equipe Rastremix deseja um feliz aniversário! Que este dia seja repleto de alegria. 🎉',
  },
  {
    id: 'renewal',
    name: 'Renovação',
    type: 'renewal',
    subject: 'Sua proteção está quase vencendo',
    message: 'Olá {name}! Sua mensalidade vence no dia {date}. Para manter seu veículo protegido, continue conosco!',
  },
  {
    id: 'alert_cold',
    name: 'Alerta Lead Frio',
    type: 'alert',
    subject: '⚠️ Lead precisa de atenção',
    message: 'Lead {name} não é contactado há {days} dias. Ação necessária para evitar perda.',
  },
  {
    id: 'deal_won',
    name: 'Negócio Fechado',
    type: 'custom',
    subject: '🎉 Parabéns! Novo negócio fechado!',
    message: 'O lead {name} fechou negócio de R$ {value}! Continue assim!',
  },
  {
    id: 'weekly_digest',
    name: 'Resumo Semanal',
    type: 'custom',
    subject: '📊 Seu resumo semanal da Rastremix',
    message: 'Olá {name}! Aqui está o resumo da semana: {summary}',
  },
];

interface NotificationAgentConfig {
  enabled: boolean;
  checkInterval: number;
  autoFollowUp: boolean;
  autoReminders: boolean;
  alertChannel: 'email' | 'whatsapp' | 'both';
}

const DEFAULT_CONFIG: NotificationAgentConfig = {
  enabled: true,
  checkInterval: 60000,
  autoFollowUp: true,
  autoReminders: true,
  alertChannel: 'both',
};

export function useNotificationAgent(config: NotificationAgentConfig = DEFAULT_CONFIG) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<Notification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { leads, appointments, addNoteToLead } = useCRMStore();

  const scheduleNotification = useCallback((notification: Notification) => {
    if (notification.scheduledFor && new Date(notification.scheduledFor) > new Date()) {
      setScheduledNotifications(prev => [...prev, notification]);
      return true;
    }
    return false;
  }, []);

  const sendNotification = useCallback((notification: Notification): boolean => {
    const newNotification: Notification = {
      ...notification,
      status: 'pending',
      sentAt: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 100));

    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, status: 'sent' as const } : n)
      );
    }, 2000);

    return true;
  }, []);

  const sendFollowUp = useCallback((leadId: string, templateId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return false;

    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return false;

    const message = template.message
      .replace('{name}', lead.name.split(' ')[0])
      .replace('{value}', (lead.value || 0).toLocaleString('pt-BR'));

    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: template.type === 'follow_up' ? 'whatsapp' : 'email',
      recipient: lead.email || lead.phone,
      subject: template.subject?.replace('{name}', lead.name.split(' ')[0]),
      message,
      status: 'pending',
    };

    return sendNotification(notification);
  }, [leads, sendNotification]);

  const checkColdLeads = useCallback(() => {
    const coldLeads = leads.filter(l => {
      if (['ganho', 'perdido'].includes(l.status)) return false;
      const daysSinceContact = l.lastContactAt
        ? Math.floor((Date.now() - new Date(l.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysSinceContact > config.checkInterval / 60000;
    });

    coldLeads.forEach(lead => {
      const notification: Notification = {
        id: `alert-${lead.id}-${Date.now()}`,
        type: config.alertChannel === 'whatsapp' ? 'sms' : 'email',
        recipient: lead.email || lead.phone,
        subject: '⚠️ Lead em Risco',
        message: `Lead ${lead.name} não é contactado há ${Math.floor(config.checkInterval / 60000)} dias. Status: ${lead.status}`,
        status: 'pending',
      };

      sendNotification(notification);
    });

    return coldLeads;
  }, [leads, config.alertChannel, config.checkInterval, sendNotification]);

  const checkUpcomingAppointments = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(0, 0, 0, 0);

    const upcomingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.startDate);
      return aptDate >= tomorrow && aptDate < dayAfterTomorrow;
    });

    upcomingAppointments.forEach(apt => {
      const template = TEMPLATES.find(t => t.id === 'reminder_install');
      if (!template) return;

      const notification: Notification = {
        id: `apt-${apt.id}-${Date.now()}`,
        type: 'email',
        recipient: apt.leadName || 'unknown',
        subject: `Lembrete: ${apt.title}`,
        message: `Você tem um compromisso amanhã: ${apt.title} às ${new Date(apt.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        status: 'pending',
      };

      sendNotification(notification);
    });

    return upcomingAppointments;
  }, [appointments, sendNotification]);

  const checkBirthdays = useCallback(() => {
    const today = new Date();
    const leadsWithBirthday = leads.filter(l => {
      if (l.status !== 'ganho') return false;
      return false;
    });

    leadsWithBirthday.forEach(lead => {
      const template = TEMPLATES.find(t => t.id === 'birthday');
      if (!template) return;

      const notification: Notification = {
        id: `bday-${lead.id}-${Date.now()}`,
        type: 'whatsapp',
        recipient: lead.phone,
        subject: template.subject?.replace('{name}', lead.name.split(' ')[0]),
        message: template.message.replace('{name}', lead.name.split(' ')[0]),
        status: 'pending',
      };

      sendNotification(notification);
    });

    return leadsWithBirthday;
  }, [leads, sendNotification]);

  const processScheduledNotifications = useCallback(() => {
    setIsProcessing(true);
    const now = new Date();

    setScheduledNotifications(prev => {
      const toSend = prev.filter(n => 
        n.scheduledFor && new Date(n.scheduledFor) <= now
      );
      
      toSend.forEach(n => sendNotification(n));

      return prev.filter(n => 
        !n.scheduledFor || new Date(n.scheduledFor) > now
      );
    });

    setIsProcessing(false);
  }, [sendNotification]);

  const createCustomNotification = useCallback((
    type: 'email' | 'sms' | 'whatsapp' | 'push',
    recipient: string,
    message: string,
    subject?: string,
    scheduledFor?: Date
  ) => {
    const notification: Notification = {
      id: `custom-${Date.now()}`,
      type,
      recipient,
      subject,
      message,
      scheduledFor,
      status: 'pending',
    };

    if (scheduledFor && scheduledFor > new Date()) {
      return scheduleNotification(notification);
    }

    return sendNotification(notification);
  }, [sendNotification, scheduleNotification]);

  const getNotificationStats = useCallback(() => {
    const sent = notifications.filter(n => n.status === 'sent').length;
    const pending = notifications.filter(n => n.status === 'pending').length;
    const failed = notifications.filter(n => n.status === 'failed').length;

    return {
      total: notifications.length,
      sent,
      pending,
      failed,
      byType: {
        email: notifications.filter(n => n.type === 'email').length,
        sms: notifications.filter(n => n.type === 'sms').length,
        whatsapp: notifications.filter(n => n.type === 'whatsapp').length,
        push: notifications.filter(n => n.type === 'push').length,
      },
    };
  }, [notifications]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setScheduledNotifications([]);
  }, []);

  useEffect(() => {
    if (!config.enabled) return;

    const interval = setInterval(() => {
      if (config.autoFollowUp) {
        checkColdLeads();
      }
      if (config.autoReminders) {
        checkUpcomingAppointments();
        processScheduledNotifications();
      }
    }, config.checkInterval);

    return () => clearInterval(interval);
  }, [config, checkColdLeads, checkUpcomingAppointments, processScheduledNotifications]);

  return {
    notifications,
    scheduledNotifications,
    templates: TEMPLATES,
    isProcessing,
    sendNotification,
    sendFollowUp,
    createCustomNotification,
    checkColdLeads,
    checkUpcomingAppointments,
    getNotificationStats,
    clearNotifications,
    scheduleNotification,
  };
}
