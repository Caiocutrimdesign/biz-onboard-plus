# Sistema de Email - Rastremix

## Configuração

Para que os emails sejam realmente enviados, você precisa:

### 1. Criar conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Crie uma API Key

### 2. Configurar domínio (opcional mas recomendado)

Para enviar emails do seu próprio domínio (ex: nao-responda@rastremix.com.br):

1. No Resend, vá em **Domains** > **Add Domain**
2. Adicione `rastremix.com.br`
3. Configure os registros DNS conforme instruções
4. Aguarde a verificação (pode levar até 24h)

### 3. Configurar variável de ambiente no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Vá em **Project Settings** > **Edge Functions**
3. Adicione a variável:
   - **Name:** `RESEND_API_KEY`
   - **Value:** sua chave do Resend (começa com `re_`)

### 4. Fazer deploy da Edge Function

```bash
cd supabase
supabase functions deploy send-email
```

## Como funciona

1. Cliente faz cadastro no site
2. Dados são salvos no Supabase
3. Edge Function `send-email` é chamada
4. Resend envia email de boas-vindas
5. Cliente recebe email profissional com:
   - Confirmação do cadastro
   - Resumo das informações
   - Próximos passos
   - Contato da empresa

## Custo

- **Resend Free Tier:** 100 emails/dia, 3.000 emails/mês
- Para a maioria dos casos, o plano gratuito é suficiente

## Alternativas

Se preferir, pode usar outros serviços:
- **SendGrid** (SendGrid/email) - similar
- **Mailgun** - bom para volumes maiores
- **Postmark** - focado em transactional emails
