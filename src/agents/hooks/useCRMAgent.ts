import { useState, useEffect, useCallback } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import type { Lead, LeadStatus } from '@/types/crm';

interface CRMAgentInsight {
  id: string;
  type: 'hot_lead' | 'cold_lead' | 'at_risk' | 'ready_to_buy' | 'follow_up_needed' | 'conversion_pattern';
  title: string;
  description: string;
  leadId?: string;
  confidence: number;
  action: string;
  createdAt: Date;
}

interface CRMAgentConfig {
  enabled: boolean;
  checkInterval: number;
  minScoreToHot: number;
  daysWithoutContactThreshold: number;
}

const DEFAULT_CONFIG: CRMAgentConfig = {
  enabled: true,
  checkInterval: 60000,
  minScoreToHot: 80,
  daysWithoutContactThreshold: 3,
};

export function useCRMAgent(config: CRMAgentConfig = DEFAULT_CONFIG) {
  const [insights, setInsights] = useState<CRMAgentInsight[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const { leads, updateLead } = useCRMStore();

  const calculateLeadScore = useCallback((lead: Lead): number => {
    let score = 0;

    if (lead.status === 'negociacao') score += 40;
    else if (lead.status === 'proposta') score += 30;
    else if (lead.status === 'qualificado') score += 20;
    else if (lead.status === 'contatado') score += 10;

    if (lead.priority === 'urgente') score += 25;
    else if (lead.priority === 'alta') score += 15;
    else if (lead.priority === 'media') score += 5;

    if (lead.value > 100000) score += 30;
    else if (lead.value > 50000) score += 20;
    else if (lead.value > 10000) score += 10;

    if (lead.tags?.includes('VIP')) score += 15;
    if (lead.tags?.includes('Quente')) score += 10;

    const daysSinceContact = lead.lastContactAt
      ? Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    if (daysSinceContact <= 1) score += 10;
    else if (daysSinceContact <= 3) score += 5;
    else if (daysSinceContact > 7) score -= 10;

    return Math.min(100, Math.max(0, score));
  }, []);

  const analyzeLead = useCallback((lead: Lead): CRMAgentInsight[] => {
    const insights: CRMAgentInsight[] = [];
    const score = calculateLeadScore(lead);
    const daysSinceContact = lead.lastContactAt
      ? Math.floor((Date.now() - new Date(lead.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (score >= config.minScoreToHot) {
      insights.push({
        id: `hot-${lead.id}`,
        type: 'hot_lead',
        title: '🔥 Lead Quente Detectado!',
        description: `${lead.name} tem score alto (${score}%) e está pronto para abordagem direta.`,
        leadId: lead.id,
        confidence: score,
        action: 'Ligar agora para fechar negócio',
        createdAt: new Date(),
      });
    }

    if (lead.status === 'ganho' && lead.value > 50000) {
      insights.push({
        id: `opp-${lead.id}`,
        type: 'ready_to_buy',
        title: '💰 Oportunidade de Upsell',
        description: `Cliente fechou R$ ${lead.value.toLocaleString('pt-BR')}. Considere oferecer plano premium.`,
        leadId: lead.id,
        confidence: 90,
        action: 'Entrar em contato para upgrade',
        createdAt: new Date(),
      });
    }

    if (daysSinceContact > config.daysWithoutContactThreshold && lead.status !== 'ganho' && lead.status !== 'perdido') {
      insights.push({
        id: `cold-${lead.id}`,
        type: 'cold_lead',
        title: '❄️ Lead Frio',
        description: `${lead.name} não é contactado há ${daysSinceContact} dias. Risk de perda.`,
        leadId: lead.id,
        confidence: 75,
        action: 'Agendar follow-up urgente',
        createdAt: new Date(),
      });
    }

    if (lead.status === 'proposta' || lead.status === 'negociacao') {
      if (!lead.nextContactAt || new Date(lead.nextContactAt) < new Date()) {
        insights.push({
          id: `risk-${lead.id}`,
          type: 'at_risk',
          title: '⚠️ Lead em Risco',
          description: `${lead.name} está há ${daysSinceContact} dias sem contato na etapa de ${lead.status}.`,
          leadId: lead.id,
          confidence: 80,
          action: 'Reativar comunicação imediatamente',
          createdAt: new Date(),
        });
      }
    }

    return insights;
  }, [calculateLeadScore, config]);

  const runAnalysis = useCallback(() => {
    if (!config.enabled) return;

    setIsRunning(true);
    const allInsights: CRMAgentInsight[] = [];

    leads.forEach(lead => {
      const leadInsights = analyzeLead(lead);
      allInsights.push(...leadInsights);
    });

    allInsights.sort((a, b) => b.confidence - a.confidence);

    setInsights(allInsights.slice(0, 10));
    setLastCheck(new Date());
    setIsRunning(false);
  }, [config.enabled, leads, analyzeLead]);

  const autoTagHotLeads = useCallback(() => {
    leads.forEach(lead => {
      const score = calculateLeadScore(lead);
      if (score >= config.minScoreToHot && !lead.tags?.includes('Quente')) {
        updateLead(lead.id, { 
          tags: [...(lead.tags || []), 'Quente'],
          priority: 'alta' 
        });
      }
    });
  }, [leads, calculateLeadScore, config.minScoreToHot, updateLead]);

  const detectConversionPatterns = useCallback((): CRMAgentInsight[] => {
    const wonLeads = leads.filter(l => l.status === 'ganho');
    const patterns: CRMAgentInsight[] = [];

    const avgDaysToClose = wonLeads.reduce((sum, l) => {
      const days = Math.floor((new Date(l.updatedAt).getTime() - new Date(l.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / (wonLeads.length || 1);

    patterns.push({
      id: `pattern-${Date.now()}`,
      type: 'conversion_pattern',
      title: '📊 Padrão de Conversão',
      description: `Média de ${Math.round(avgDaysToClose)} dias para fechar negócio. Leads que demoram mais que ${Math.round(avgDaysToClose * 1.5)} dias precisam de atenção.`,
      confidence: 85,
      action: 'Revisar processo de vendas',
      createdAt: new Date(),
    });

    const hotSources = Object.entries(
      leads.filter(l => l.status === 'ganho')
        .reduce((acc, l) => {
          acc[l.source] = (acc[l.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a);

    if (hotSources.length > 0) {
      patterns.push({
        id: `source-${Date.now()}`,
        type: 'conversion_pattern',
        title: '🎯 Melhor Fonte de Leads',
        description: `${hotSources[0][0]} tem a maior taxa de conversão (${hotSources[0][1]} vendas). Invista mais nessa fonte!`,
        confidence: 80,
        action: `Aumentar investimento em ${hotSources[0][0]}`,
        createdAt: new Date(),
      });
    }

    return patterns;
  }, [leads]);

  useEffect(() => {
    if (!config.enabled) return;

    runAnalysis();
    const interval = setInterval(runAnalysis, config.checkInterval);
    return () => clearInterval(interval);
  }, [config.enabled, config.checkInterval, runAnalysis]);

  return {
    insights,
    isRunning,
    lastCheck,
    runAnalysis,
    autoTagHotLeads,
    detectConversionPatterns,
    calculateLeadScore,
  };
}
