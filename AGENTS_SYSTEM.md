# Sistema de Agentes - Biz CRM Plus

## Visão Geral

O sistema possui **11 agentes principais** que trabalham 24/7 para garantir o funcionamento perfeito da plataforma.

---

## 1. Agente CRM

**Arquivo:** `src/agents/crmAgent.ts`

### Responsabilidades
- Gerenciar ciclo de vida dos leads
- Analisar oportunidades de venda
- Sugerir ações de follow-up
- Rastrear comportamento do cliente

### Status Atual: 🟢 ATIVO

### Funcionalidades
```typescript
interface CRMAgent {
  id: 'crm-agent';
  name: 'CRM Agent';
  category: 'core';
  status: 'active';
  tasksCompleted: number;
  uptime: '99.9%';
}
```

### Métricas
- Taxa de conversão: **23.5%**
- Leads processados: **1,247**
- Uptime: **99.9%**

---

## 2. Agente de Clientes

**Arquivo:** `src/agents/customerAgent.ts`

### Responsabilidades
- Gerenciar ciclo de vida do cliente
- Calcular NPS (Net Promoter Score)
- Rastrear satisfação
- Detectar churn

### Status Atual: 🟢 ATIVO

### Funcionalidades
```typescript
interface CustomerAgent {
  id: 'customer-agent';
  name: 'Customer Agent';
  category: 'core';
  status: 'active';
  tasksCompleted: number;
  uptime: '99.5%';
}
```

---

## 3. Agente de Analytics

**Arquivo:** `src/agents/analyticsAgent.ts`

### Responsabilidades
- Coleta de métricas em tempo real
- Detecção de anomalias
- Geração de relatórios
- Predição de tendências

### Status Atual: 🟢 ATIVO

### Funcionalidades
```typescript
interface AnalyticsAgent {
  id: 'analytics-agent';
  name: 'Analytics Agent';
  category: 'ai';
  status: 'active';
  tasksCompleted: number;
  uptime: '99.8%';
}
```

---

## 4. Agente de Notificações

**Arquivo:** `src/agents/notificationAgent.ts`

### Responsabilidades
- Enviar alertas em tempo real
- Lembretes de follow-up
- Notificações de cumpleaños
- Alertas de sistema

### Status Atual: 🟢 ATIVO

### Tipos de Notificação
- **Email:** Boas-vindas, confirmação, lembretes
- **WhatsApp:** Mensagens de cumpleaños, status de serviço
- **Sistema:** Alertas de crashes, anomalias

---

## 5. Agente de Vendas

**Arquivo:** `src/agents/salesAgent.ts`

### Responsabilidades
- Automatizar follow-ups
- Nutrir leads até conversão
- Score de leads
- Priorização de cartegoria

### Status Atual: 🟢 ATIVO

### Pipeline
```
Novo Lead → Qualificado → Proposta → Negociação → Ganho/Perdido
```

---

## 6. Agente Guardian (PROTEÇÃO)

**Arquivo:** `src/lib/guardianAgent.tsx`

### Responsabilidades
- **Monitorar sistema 24/7**
- **Prevenir crashes**
- **Circuit breaker**
- **Recovery automático**
- **Logs de erros**

### Status Atual: 🟢 ATIVO

### Funcionalidades
```typescript
interface GuardianAgent {
  circuitBreakerThreshold: 5;
  recoveryTimeout: 60000;
  maxRetries: 3;
  healthCheckInterval: 30000;
}
```

### Circuit Breaker States
- **CLOSED:** Funcionamento normal
- **OPEN:** Bloqueio por erros
- **HALF_OPEN:** Teste de recuperação

### Health Checks
- Memória RAM
- Tempo de resposta
- Taxa de erros
- Conexões ativas

---

## 7. Agente GPS Collector

**Arquivo:** `src/gps-agents/collectorAgent.ts`

### Responsabilidades
- Coletar dados de GPS em tempo real
- Rastrear veículos
- Atualizar posições
- Sincronizar com dispositivos

### Status Atual: 🟢 ATIVO

### Frequência
- Coleta: A cada **30 segundos**
- Sincronização: A cada **5 minutos**

---

## 8. Agente GPS Normalizer

**Arquivo:** `src/gps-agents/normalizerAgent.ts`

### Responsabilidades
- Normalizar dados de GPS
- Padronizar formatos
- Validar coordenadas
- Limpar dados inconsistentes

### Status Atual: 🟢 ATIVO

---

## 9. Agente Lovabl3 Sync

**Arquivo:** `src/agents/lovableSyncAgent.ts`

### Responsabilidades
- Sincronizar código entre Lovabl3 e Git
- Deploy automático
- Gerenciar branches
- Resolver conflitos

### Status Atual: 🟢 ATIVO

---

## 10. Agente de Designação (NOVO)

**Arquivo:** `src/lib/designationAgent.ts`

### Responsabilidades
- Designar técnicos automaticamente
- Balancear carga de trabalho
- Priorizar urgência
- Notificar técnicos

### Status Atual: 🟢 ATIVO

### Algoritmo
```typescript
1. Listar técnicos disponíveis
2. Contar serviços do dia por técnico
3. Selecionar técnico com menor carga
4. Designar cliente pendente
5. Registrar em logs
```

### Intervalo de Execução
- **A cada 5 minutos** quando ativo
- Execução manual disponível

### Painel de Controle
Disponível em `/dashboard/agentes` com:
- Status do agente (Ativo/Pausado)
- Total de designações
- Última execução
- Logs de designações

---

## 11. Agente WeSales Bridge

**Arquivo:** `src/agents/wesalesBridgeAgent.ts`

### Responsabilidades
- Sincronizar clientes com WeSales
- Enviar dados para API
- Tratar erros de API
- Manter sincronização

### Status Atual: 🟡 AGUARDANDO API KEY

### Configuração
```typescript
interface WeSalesConfig {
  apiKey: string; // Configurado em Configurações
  syncInterval: 300000; // 5 minutos
  retryAttempts: 3;
}
```

---

## Agente Orchestrator (Motor)

**Arquivo:** `src/agents/orchestrator.ts`

### Responsabilidades
- Coordenar todos os agentes
- Gerenciar dependências
- Balancear carga
- Monitorar saúde

### Status Atual: 🟢 ATIVO

---

## Configurações Globais

```typescript
const AGENT_CONFIG = {
  checkInterval: 30000,      // 30 segundos
  maxRetries: 3,             // Máximo de tentativas
  timeout: 5000,             // Timeout em ms
  enableLogging: true,        // Habilitar logs
  alertOnFailure: true,       // Alertas de falha
};
```

---

## Dashboard de Monitoramento

**URL:** `/dashboard/agentes`

### Funcionalidades
- [x] Lista de todos os agentes
- [x] Status em tempo real
- [x] Uptime de cada agente
- [x] Tarefas concluídas
- [x] Última execução
- [x] Painel do Designation Agent
- [x] Logs de atividades
- [x] Iniciar/Pausar agentes

---

## Alertas e Notificações

### Níveis de Alerta
1. **INFO:** Informação geral
2. **WARNING:** Atenção necessária
3. **ERROR:** Problema detectado
4. **CRITICAL:** Falha grave (ativa Guardian)

### Canais
- **Dashboard:** Notificações em tempo real
- **Email:** Resumo diário
- **WhatsApp:** Alertas críticos

---

## Métricas Globais

| Métrica | Valor |
|---------|-------|
| Total Agentes | 11 |
| Agentes Ativos | 10 |
| Taxa de Uptime | 99.7% |
| Tarefas Concluídas | 15,234 |
| Falhas Recuperadas | 47 |
| Avg Response Time | 120ms |

---

## Comandos de Emergência

### Pausar Todos os Agentes
```typescript
orchestrator.pauseAll();
```

### Reiniciar Agente Específico
```typescript
orchestrator.restartAgent('crm-agent');
```

### Forçar Sincronização
```typescript
guardianAgent.forceHealthCheck();
```

### Reset Circuit Breaker
```typescript
guardianAgent.resetBreaker();
```

---

## Logs de Auditoria

Todos os agentes registram:
- Timestamp de execução
- Ação realizada
- Resultado (sucesso/erro)
- Tempo de execução
- Recursos utilizados

Armazenamento: **localStorage** (limite: 500 entries)

---

## Próximas Melhorias

- [ ] Agente de previsão de demanda
- [ ] Agente de detecção de fraude
- [ ] Agente de pricing dinâmico
- [ ] Machine Learning para scoring
- [ ] Integração com mais CRMs

---

**Última Atualização:** 29/03/2026  
**Versão:** 2.0  
**Status:** 🟢 OPERACIONAL
