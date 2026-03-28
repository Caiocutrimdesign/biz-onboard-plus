import { useState, useCallback, useMemo } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import type { Lead, Analytics } from '@/types/crm';

interface Report {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  title: string;
  description: string;
  data: any;
  createdAt: Date;
  generatedBy: 'ai';
}

interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  insight: string;
}

interface AnalyticsAgentConfig {
  enabled: boolean;
  refreshInterval: number;
  includePredictions: boolean;
  showTrends: boolean;
}

const DEFAULT_CONFIG: AnalyticsAgentConfig = {
  enabled: true,
  refreshInterval: 300000,
  includePredictions: true,
  showTrends: true,
};

export function useAnalyticsAgent(config: AnalyticsAgentConfig = DEFAULT_CONFIG) {
  const [reports, setReports] = useState<Report[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { leads, analytics } = useCRMStore();

  const calculateTrends = useCallback((data: number[], period: number = 7) => {
    if (data.length < 2) return { trend: 'stable' as const, change: 0 };
    
    const recent = data.slice(-period);
    const previous = data.slice(-period * 2, -period);
    
    if (previous.length === 0) return { trend: 'stable' as const, change: 0 };
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      trend: change > 5 ? 'up' as const : change < -5 ? 'down' as const : 'stable' as const,
      change: Math.round(change * 10) / 10,
    };
  }, []);

  const generatePredictions = useCallback((): Prediction[] => {
    const preds: Prediction[] = [];

    const wonLeads = leads.filter(l => l.status === 'ganho');
    const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const avgDealValue = wonLeads.length > 0 ? totalRevenue / wonLeads.length : 0;

    const newLeadsThisMonth = leads.filter(l => {
      const d = new Date(l.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    const lastMonthLeads = leads.filter(l => {
      const d = new Date(l.createdAt);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
      return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
    }).length;

    const growthRate = lastMonthLeads > 0 ? ((newLeadsThisMonth - lastMonthLeads) / lastMonthLeads) * 100 : 0;

    preds.push({
      metric: 'Novos Leads',
      current: newLeadsThisMonth,
      predicted: Math.round(newLeadsThisMonth * (1 + growthRate / 100)),
      trend: growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'stable',
      confidence: 75,
      insight: growthRate > 0 
        ? `📈 Crescimento de ${growthRate.toFixed(1)}% em relação ao mês passado!`
        : growthRate < 0 
        ? `📉 Queda de ${Math.abs(growthRate).toFixed(1)}% em relação ao mês passado.`
        : '➡️ Número de leads estável em relação ao mês passado.',
    });

    const nextMonthRevenue = avgDealValue * newLeadsThisMonth * (analytics?.conversionRate || 30) / 100;
    preds.push({
      metric: 'Receita Projetada',
      current: totalRevenue,
      predicted: Math.round(nextMonthRevenue),
      trend: nextMonthRevenue > totalRevenue ? 'up' : nextMonthRevenue < totalRevenue ? 'down' : 'stable',
      confidence: 65,
      insight: `Baseado na taxa de conversão atual, projeção de R$ ${nextMonthRevenue.toLocaleString('pt-BR')}/mês.`,
    });

    const coldLeads = leads.filter(l => {
      if (l.status === 'ganho' || l.status === 'perdido') return false;
      const daysSinceContact = l.lastContactAt
        ? Math.floor((Date.now() - new Date(l.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      return daysSinceContact > 7;
    });
    const churnRisk = leads.length > 0 ? (coldLeads.length / leads.length) * 100 : 0;

    preds.push({
      metric: 'Risco de Perda',
      current: coldLeads.length,
      predicted: Math.round(coldLeads.length * 1.2),
      trend: churnRisk > 20 ? 'up' : 'stable',
      confidence: 80,
      insight: churnRisk > 20
        ? `⚠️ ${churnRisk.toFixed(1)}% dos leads estão frios. Ação necessária!`
        : `✅ Apenas ${churnRisk.toFixed(1)}% dos leads precisam de atenção.`,
    });

    return preds;
  }, [leads, analytics]);

  const generateDailyReport = useCallback((): Report => {
    const today = new Date();
    const todayLeads = leads.filter(l => {
      const d = new Date(l.createdAt);
      return d.toDateString() === today.toDateString();
    });

    const todayConversions = leads.filter(l => {
      const d = new Date(l.updatedAt);
      return d.toDateString() === today.toDateString() && l.status === 'ganho';
    });

    const todayRevenue = todayConversions.reduce((sum, l) => sum + (l.value || 0), 0);

    const topSources = Object.entries(
      leads.reduce((acc, l) => {
        acc[l.source] = (acc[l.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a).slice(0, 3);

    const topSellers = Object.entries(
      leads.reduce((acc, l) => {
        if (l.ownerId) {
          acc[l.ownerId] = (acc[l.ownerId] || 0) + (l.status === 'ganho' ? l.value || 0 : 0);
        }
        return acc;
      }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a).slice(0, 3);

    return {
      id: `report-${Date.now()}`,
      type: 'daily',
      title: `📊 Relatório do Dia ${today.toLocaleDateString('pt-BR')}`,
      description: 'Resumo das atividades de vendas',
      data: {
        newLeads: todayLeads.length,
        conversions: todayConversions.length,
        revenue: todayRevenue,
        topSources,
        topSellers,
        pipelineSummary: {
          novo: leads.filter(l => l.status === 'novo').length,
          contatado: leads.filter(l => l.status === 'contatado').length,
          qualificado: leads.filter(l => l.status === 'qualificado').length,
          proposta: leads.filter(l => l.status === 'proposta').length,
          negociacao: leads.filter(l => l.status === 'negociacao').length,
          ganho: leads.filter(l => l.status === 'ganho').length,
        },
      },
      createdAt: new Date(),
      generatedBy: 'ai',
    };
  }, [leads]);

  const generateWeeklyReport = useCallback((): Report => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekLeads = leads.filter(l => new Date(l.createdAt) >= weekAgo);
    const weekConversions = leads.filter(l => 
      l.status === 'ganho' && new Date(l.updatedAt) >= weekAgo
    );
    const weekRevenue = weekConversions.reduce((sum, l) => sum + (l.value || 0), 0);
    
    const conversionRate = weekLeads.length > 0 
      ? (weekConversions.length / weekLeads.length) * 100 
      : 0;

    const leadsTrend = calculateTrends(weekLeads.length > 0 ? [weekLeads.length] : []);

    const wonBySource = leads
      .filter(l => l.status === 'ganho' && new Date(l.updatedAt) >= weekAgo)
      .reduce((acc, l) => {
        acc[l.source] = (acc[l.source] || 0) + (l.value || 0);
        return acc;
      }, {} as Record<string, number>);

    const bestDay = Object.entries(
      weekLeads.reduce((acc, l) => {
        const day = new Date(l.createdAt).toLocaleDateString('pt-BR');
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a)[0];

    return {
      id: `report-${Date.now()}`,
      type: 'weekly',
      title: '📈 Relatório Semanal de Vendas',
      description: `Período: ${weekAgo.toLocaleDateString('pt-BR')} a ${now.toLocaleDateString('pt-BR')}`,
      data: {
        totalLeads: weekLeads.length,
        conversions: weekConversions.length,
        conversionRate: conversionRate.toFixed(1),
        revenue: weekRevenue,
        leadsTrend,
        wonBySource,
        bestDay: bestDay ? `${bestDay[0]}: ${bestDay[1]} leads` : 'N/A',
        topPerformers: weekConversions.slice(0, 5).map(l => ({
          name: l.name,
          value: l.value || 0,
        })),
      },
      createdAt: new Date(),
      generatedBy: 'ai',
    };
  }, [leads, calculateTrends]);

  const generateMonthlyReport = useCallback((): Report => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthLeads = leads.filter(l => new Date(l.createdAt) >= monthStart);
    const monthConversions = leads.filter(l => 
      l.status === 'ganho' && new Date(l.updatedAt) >= monthStart
    );
    const monthRevenue = monthConversions.reduce((sum, l) => sum + (l.value || 0), 0);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastMonthLeads = leads.filter(l => {
      const d = new Date(l.createdAt);
      return d >= lastMonthStart && d <= lastMonthEnd;
    });

    const revenueGrowth = lastMonthLeads.length > 0
      ? ((monthLeads.length - lastMonthLeads.length) / lastMonthLeads.length) * 100
      : 0;

    const avgDealSize = monthConversions.length > 0 
      ? monthRevenue / monthConversions.length 
      : 0;

    const sourceDistribution = Object.entries(
      monthLeads.reduce((acc, l) => {
        acc[l.source] = (acc[l.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([source, count]) => ({
      source,
      count,
      percentage: ((count / monthLeads.length) * 100).toFixed(1),
    })).sort((a, b) => b.count - a.count);

    const statusDistribution = Object.entries(
      leads.reduce((acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    );

    return {
      id: `report-${Date.now()}`,
      type: 'monthly',
      title: `📊 Relatório Mensal - ${now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      description: 'Análise completa do mês',
      data: {
        totalLeads: monthLeads.length,
        totalConversions: monthConversions.length,
        totalRevenue: monthRevenue,
        avgDealSize,
        revenueGrowth: revenueGrowth.toFixed(1),
        leadsPerDay: (monthLeads.length / now.getDate()).toFixed(1),
        conversionRate: ((monthConversions.length / monthLeads.length) * 100).toFixed(1),
        sourceDistribution,
        statusDistribution,
        predictions: generatePredictions().slice(0, 2),
      },
      createdAt: new Date(),
      generatedBy: 'ai',
    };
  }, [leads, generatePredictions]);

  const generateReport = useCallback((type: 'daily' | 'weekly' | 'monthly' = 'daily') => {
    setIsGenerating(true);
    
    let report: Report;
    switch (type) {
      case 'weekly':
        report = generateWeeklyReport();
        break;
      case 'monthly':
        report = generateMonthlyReport();
        break;
      default:
        report = generateDailyReport();
    }

    setReports(prev => [report, ...prev].slice(0, 10));
    setLastUpdate(new Date());
    setIsGenerating(false);

    if (config.includePredictions) {
      setPredictions(generatePredictions());
    }

    return report;
  }, [generateDailyReport, generateWeeklyReport, generateMonthlyReport, generatePredictions, config.includePredictions]);

  const summary = useMemo(() => {
    const wonLeads = leads.filter(l => l.status === 'ganho');
    const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const avgDealValue = wonLeads.length > 0 ? totalRevenue / wonLeads.length : 0;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekLeads = leads.filter(l => new Date(l.createdAt) >= weekAgo);

    return {
      totalLeads: leads.length,
      newThisWeek: thisWeekLeads.length,
      totalRevenue,
      avgDealValue,
      conversionRate: analytics?.conversionRate || 0,
      activeDeals: leads.filter(l => !['ganho', 'perdido'].includes(l.status)).length,
    };
  }, [leads, analytics]);

  return {
    reports,
    predictions,
    summary,
    isGenerating,
    lastUpdate,
    generateReport,
    generatePredictions,
  };
}
