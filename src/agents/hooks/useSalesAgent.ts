import { useState, useCallback, useMemo } from 'react';
import { useCRMStore } from '@/stores/crmStore';
import type { Lead, SalesInsight } from '@/agents/types';

interface SalesStrategy {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
  action: string;
}

interface SalesAgentConfig {
  enabled: boolean;
  checkInterval: number;
  minValueToUpsell: number;
  followUpDays: number;
}

const DEFAULT_CONFIG: SalesAgentConfig = {
  enabled: true,
  checkInterval: 120000,
  minValueToUpsell: 50000,
  followUpDays: 3,
};

export function useSalesAgent(config: SalesAgentConfig = DEFAULT_CONFIG) {
  const [insights, setInsights] = useState<SalesInsight[]>([]);
  const [strategies, setStrategies] = useState<SalesStrategy[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { leads, updateLead } = useCRMStore();

  const qualifyLead = useCallback((lead: any): { score: number; tier: 'hot' | 'warm' | 'cold'; reasons: string[] } => {
    const reasons: string[] = [];
    let score = 0;

    if (lead.value >= config.minValueToUpsell) {
      score += 30;
      reasons.push('Alto valor potencial');
    }

    if (lead.status === 'negociacao') {
      score += 25;
      reasons.push('Etapa de negociação');
    } else if (lead.status === 'proposta') {
      score += 20;
      reasons.push('Proposta enviada');
    } else if (lead.status === 'qualificado') {
      score += 15;
      reasons.push('Lead qualificado');
    }

    if (lead.priority === 'urgente') {
      score += 20;
      reasons.push('Prioridade urgente');
    } else if (lead.priority === 'alta') {
      score += 10;
      reasons.push('Alta prioridade');
    }

    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceCreation <= 7) {
      score += 10;
      reasons.push('Lead recente');
    }

    if (lead.tags?.includes('Quente')) {
      score += 15;
      reasons.push('Tag quente');
    }
    if (lead.tags?.includes('VIP')) {
      score += 10;
      reasons.push('Cliente VIP');
    }

    const tier = score >= 70 ? 'hot' as const : score >= 40 ? 'warm' as const : 'cold' as const;

    return { score, tier, reasons };
  }, [config.minValueToUpsell]);

  const generateNextAction = useCallback((lead: any): string => {
    switch (lead.status) {
      case 'novo':
        return `📞 Ligar para ${lead.name} nas próximas 24h. Introdução e descoberta de necessidades.`;
      
      case 'contatado':
        return `📧 Enviar proposta personalizada baseada nas necessidades identificadas. Acompanhar em 2 dias.`;
      
      case 'qualificado':
        return `🎯 Agendar apresentação/demo do produto. Preparar caso de sucesso do mesmo segmento.`;
      
      case 'proposta':
        return `💰 Fazer follow-up da proposta. Verificar se há dúvidas. Negociar se necessário.`;
      
      case 'negociacao':
        return `🤝 Agendar reunião para fechar negócio. Ter pronto condições especiais de pagamento.`;
      
      default:
        return `📋 Revisar status e definir próximo passo.`;
    }
  }, []);

  const detectUpsellOpportunities = useCallback((): SalesInsight[] => {
    const opportunities: SalesInsight[] = [];

    const wonLeads = leads.filter(l => l.status === 'ganho');
    
    wonLeads.forEach(lead => {
      if (lead.value >= config.minValueToUpsell) {
        opportunities.push({
          type: 'opportunity',
          title: '💎 Oportunidade de Upgrade',
          description: `${lead.name} fechou R$ ${lead.value.toLocaleString('pt-BR')}. Considere oferecer plano premium.`,
          leadId: lead.id,
          confidence: 85,
          action: 'Entrar em contato para upgrade de plano',
        });
      }
    });

    const highValuePotential = leads.filter(l => 
      !['ganho', 'perdido'].includes(l.status) && l.value >= config.minValueToUpsell
    );
    
    highValuePotential.forEach(lead => {
      opportunities.push({
        type: 'opportunity',
        title: '🎯 Lead de Alto Valor',
        description: `${lead.name} tem potencial de R$ ${lead.value.toLocaleString('pt-BR')}. Priorize este lead.`,
        leadId: lead.id,
        confidence: 75,
        action: generateNextAction(lead),
      });
    });

    return opportunities;
  }, [leads, config.minValueToUpsell, generateNextAction]);

  const generateStrategies = useCallback((): SalesStrategy[] => {
    const strategies: SalesStrategy[] = [];

    const coldLeads = leads.filter(l => {
      if (['ganho', 'perdido'].includes(l.status)) return false;
      const days = l.lastContactAt
        ? Math.floor((Date.now() - new Date(l.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      return days > config.followUpDays;
    });

    if (coldLeads.length > 0) {
      strategies.push({
        id: 'reactivate-cold',
        name: 'Reativar Leads Frios',
        description: `${coldLeads.length} leads não são contactados há mais de ${config.followUpDays} dias.`,
        priority: 'high',
        estimatedImpact: `Potencial de reativar ${Math.round(coldLeads.length * 0.3)} leads`,
        action: 'Criar sequência de reativação com oferta especial',
      });
    }

    const inNegotiation = leads.filter(l => l.status === 'negociacao');
    if (inNegotiation.length > 0) {
      strategies.push({
        id: 'close-deals',
        name: 'Fechar Negociações',
        description: `${inNegotiation.length} leads estão em negociação. Total: R$ ${inNegotiation.reduce((s, l) => s + (l.value || 0), 0).toLocaleString('pt-BR')}`,
        priority: 'high',
        estimatedImpact: `Fechar ${Math.round(inNegotiation.length * 0.6)} negócios`,
        action: 'Agendar calls de fechamento esta semana',
      });
    }

    const highValueLeads = leads.filter(l => l.value >= config.minValueToUpsell && !['ganho', 'perdido'].includes(l.status));
    if (highValueLeads.length > 0) {
      strategies.push({
        id: 'focus-high-value',
        name: 'Foco em Leads de Alto Valor',
        description: `${highValueLeads.length} leads com valor acima de R$ ${(config.minValueToUpsell / 1000).toFixed(0)}k`,
        priority: 'medium',
        estimatedImpact: `Potencial de R$ ${highValueLeads.reduce((s, l) => s + (l.value || 0), 0).toLocaleString('pt-BR')}`,
        action: 'Dedicar tempo exclusivo para estes leads',
      });
    }

    const sources = Object.entries(
      leads.filter(l => l.status === 'ganho')
        .reduce((acc, l) => {
          acc[l.source] = (acc[l.source] || 0) + (l.value || 0);
          return acc;
        }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a);

    if (sources.length > 0) {
      strategies.push({
        id: 'invest-best-source',
        name: 'Investir na Melhor Fonte',
        description: `${sources[0][0]} gerou mais receita: R$ ${sources[0][1].toLocaleString('pt-BR')}`,
        priority: 'medium',
        estimatedImpact: `Aumentar investimento em ${sources[0][0]} pode gerar +30% leads`,
        action: `Aumentar budget de marketing para ${sources[0][0]}`,
      });
    }

    return strategies;
  }, [leads, config.followUpDays, config.minValueToUpsell]);

  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);

    const allInsights: SalesInsight[] = [];

    leads.forEach(lead => {
      const { score, tier, reasons } = qualifyLead(lead);

      if (tier === 'hot') {
        allInsights.push({
          type: 'lead_score',
          title: '🔥 Lead Quente',
          description: `${lead.name} - Score: ${score}/100\n${reasons.join('\n')}`,
          leadId: lead.id,
          confidence: score,
          action: generateNextAction(lead),
        });
      }

      if (tier === 'warm' && lead.status === 'proposta') {
        allInsights.push({
          type: 'risk_alert',
          title: '⏰ Proposta Enviada',
          description: `${lead.name} recebeu proposta há alguns dias. Follow-up necessário.`,
          leadId: lead.id,
          confidence: 80,
          action: 'Fazer follow-up da proposta agora',
        });
      }
    });

    allInsights.push(...detectUpsellOpportunities());

    allInsights.sort((a, b) => b.confidence - a.confidence);

    setInsights(allInsights.slice(0, 15));
    setStrategies(generateStrategies());
    setIsAnalyzing(false);
  }, [leads, qualifyLead, generateNextAction, detectUpsellOpportunities, generateStrategies]);

  const getNextBestLead = useCallback(() => {
    const availableLeads = leads.filter(l => 
      !['ganho', 'perdido'].includes(l.status)
    );

    const scoredLeads = availableLeads.map(lead => ({
      lead,
      ...qualifyLead(lead),
    }));

    scoredLeads.sort((a, b) => b.score - a.score);

    return scoredLeads[0]?.lead || null;
  }, [leads, qualifyLead]);

  const getDailyGoals = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLeads = leads.filter(l => 
      new Date(l.createdAt) >= today
    );

    const todayConversions = leads.filter(l => 
      l.status === 'ganho' && new Date(l.updatedAt) >= today
    );

    return {
      newLeads: todayLeads.length,
      targetNewLeads: 5,
      conversions: todayConversions.length,
      targetConversions: 2,
      revenue: todayConversions.reduce((sum, l) => sum + (l.value || 0), 0),
      targetRevenue: 10000,
    };
  }, [leads]);

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    
    const nextLead = getNextBestLead();
    if (nextLead) {
      recs.push(`🎯 Priorize: ${nextLead.name} - ${generateNextAction(nextLead)}`);
    }

    const urgentLeads = leads.filter(l => l.priority === 'urgente' && !['ganho', 'perdido'].includes(l.status));
    if (urgentLeads.length > 0) {
      recs.push(`⚠️ ${urgentLeads.length} leads urgentes precisam de atenção`);
    }

    const noContact = leads.filter(l => {
      if (['ganho', 'perdido'].includes(l.status)) return false;
      const days = l.lastContactAt
        ? Math.floor((Date.now() - new Date(l.lastContactAt).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      return days > 7;
    });
    if (noContact.length > 0) {
      recs.push(`❄️ ${noContact.length} leads frios - risque follow-up`);
    }

    return recs;
  }, [getNextBestLead, generateNextAction, leads]);

  return {
    insights,
    strategies,
    isAnalyzing,
    runAnalysis,
    qualifyLead,
    generateNextAction,
    detectUpsellOpportunities,
    getNextBestLead,
    getDailyGoals,
    recommendations,
  };
}
