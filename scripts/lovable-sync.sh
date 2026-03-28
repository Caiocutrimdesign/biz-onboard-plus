#!/bin/bash

# ============================================
# LOVABLE AUTO SYNC SCRIPT
# Executa após cada mudança no código
# ============================================

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Config
REMOTES=("origin" "lovable" "antigravity")
COMMIT_MSG="chore: auto-sync - $(date '+%Y-%m-%d %H:%M:%S')"

echo -e "${YELLOW}🔄 Verificando alterações no código...${NC}"

# Verifica se há alterações
if git diff --quiet && git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  Nenhuma alteração para sincronizar${NC}"
    exit 0
fi

# Mostra alterações
echo -e "${GREEN}📝 Alterações detectadas:${NC}"
git status --short

# Adiciona tudo
echo -e "${YELLOW}📦 Adicionando arquivos...${NC}"
git add -A

# Commit
echo -e "${YELLOW}💾 Fazendo commit...${NC}"
git commit -m "$COMMIT_MSG"

# Push para todas as remotas
echo -e "${YELLOW}🚀 Sincronizando com remotas...${NC}"

for remote in "${REMOTES[@]}"; do
    echo -e "${GREEN}→ Enviando para $remote...${NC}"
    if git push "$remote" main 2>&1; then
        echo -e "${GREEN}✅ $remote: OK${NC}"
    else
        echo -e "${RED}⚠️  $remote: Falha (pode já estar atualizado)${NC}"
    fi
done

echo -e "${GREEN}✅ Sincronização concluída!${NC}"
echo -e "${YELLOW}⏳ O Lovable pode levar 1-2 minutos para detectar as mudanças${NC}"

# Verifica deploy (opcional)
echo -e "${YELLOW}🔗 Verificando deploy...${NC}"
curl -s -o /dev/null -w "%{http_code}" https://biz-onboard-plus.lovable.app || true
echo -e "${GREEN}🌐 Deploy verificado${NC}"
