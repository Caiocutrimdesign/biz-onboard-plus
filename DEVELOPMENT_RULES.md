# REGRAS DE DESENVOLVIMENTO - BIZ CRM PLUS

## REGRAS ABSOLUTAS - NUNCA VIOLAR

### 1. PROTEÇÃO DE FUNCIONALIDADES EXISTENTES

**REGRA CRÍTICA: Jamais remova, modifique ou quebre funcionalidades existentes sem autorização explícita do usuário.**

Antes de qualquer alteração:
- ✅ Verificar se a funcionalidade existe no código
- ✅ Testar se está funcionando antes de fazer mudanças
- ✅ Perguntar ao usuário antes de remover qualquer coisa
- ✅ Fazer backup antes de modificar código existente

### 2. MODIFICAÇÕES PERMITIDAS

Quando o usuário solicitar mudanças:
1. Mostrar o que vai ser alterado
2. Confirmar com o usuário antes de implementar
3. Testar a mudança
4. Perguntar se está satisfeito com o resultado

### 3. RECUPERAÇÃO DE FUNCIONALIDADES

Se algo for quebrado acidentalmente:
1. Identificar o problema imediatamente
2. Reverter para a versão anterior se necessário
3. Comunicar o usuário sobre o problema
4. Corrigir e testar antes de continuar

### 4. PÁGINAS E COMPONENTES PROTEGIDOS

O sistema possui as seguintes páginas que NUNCA devem ser removidas ou desabilitadas:

- **Dashboard** (`/dashboard`) - Visão geral do sistema
- **CRM** (`/crm`) - Gestão de clientes
- **Aniversariantes** (`/crm/aniversariantes`) - Sistema de mensagens de aniversário
- **TEC** (`/tec`) - Central de serviços técnicos
- **ERP** (`/erp`) - Gestão empresarial
- **SHELL** (`/shell`) - Módulo de vendas
- **Agentes** (`/dashboard/agentes`) - Monitoramento de agentes 24/7
- **Admin Dashboard** (`/admin`) - Painel administrativo
- **Login** (`/admin/login`) - Autenticação

### 5. MENU LATERAL

O menu lateral deve SEMPRE mostrar todos os módulos disponíveis:
- Dashboard
- CRM  
- Aniversariantes (com ícone Cake)
- TEC
- ERP
- SHELL
- Agentes

### 6. FUNCIONALIDADES DO CRM

O sistema CRM deve manter SEMPRE:
- Lista de clientes com busca e filtros
- Status: Novo, Ativo, Inativo, Desativado, Pendente, Cancelado
- Botões de ação: Visualizar, Editar, Ativar, Inativar, WhatsApp, WeSales
- Sincronização com Supabase
- Fallback para localStorage

### 7. REGISTRO DE CLIENTES

O formulário de registro deve manter SEMPRE:
- Dados pessoais (nome, telefone, email, CPF)
- Endereço completo
- Dados do veículo
- Seleção de plano
- Seleção de técnico (novo)
- Forma de pagamento
- Confirmação final

### 8. SISTEMA DE ANIVERSARIANTES

Deve manter SEMPRE:
- Lista de aniversariantes por mês
- Aniversariantes do dia em destaque
- Envio de mensagens via WhatsApp
- Variáveis: {nome}, {idade}, {empresa}
- Status de mensagens enviadas

### 9. AGENTES DO SISTEMA

Os agentes devem funcionar 24/7:
- CRM Agent
- Customer Agent
- Analytics Agent
- Notification Agent
- Sales Agent
- Guardian Agent (prevenção de crashes)
- GPS Collector Agent
- GPS Normalizer Agent
- Lovabl3 Sync Agent
- **NOVO: Designation Agent** (designação de técnicos)

### 10. ANTES DE COMMITAR

Antes de fazer commit, verificar:
- [ ] Build compilou sem erros
- [ ] Todas as páginas estão acessíveis
- [ ] Menu lateral mostra todos os itens
- [ ] Funcionalidades principais funcionam
- [ ] Não foi removida nenhuma funcionalidade existente

### 11. EM CASO DE DÚVIDA

Se não tiver certeza sobre alguma mudança:
1. **PARAR** e perguntar ao usuário
2. Mostrar o código que será afetado
3. Explicar o impacto da mudança
4. Aguardar confirmação explícita

### 12. COMUNICAÇÃO

O usuário deve ser sempre informado sobre:
- O que está sendo feito
- O que foi alterado
- Problemas encontrados
- Próximos passos

---

**LEMBRETE**: O usuário é o dono do sistema. Qualquer mudança significativa deve ser comunicada e aprovada.
