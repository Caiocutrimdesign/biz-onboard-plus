# Sistema de Email - Rastremix

## ✅ CONFIGURADO COM RESEND

A API Key foi configurada. Para ativar o envio de emails:

### Passos no Supabase Dashboard:

1. Acesse https://supabase.com
2. Vá em **Project Settings** > **Edge Functions** > **Secrets**
3. Adicione:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_VShVBMiB_FazW8UZd1zzjnAUZycDuPMc9`

4. Depois vá em **Edge Functions** e faça deploy:
   ```bash
   cd supabase
   npx supabase functions deploy send-email
   ```

### O que acontece quando um cliente se cadastra:

1. Cliente preenche o formulário
2. Dados são salvos no banco
3. Email de boas-vindas é enviado automaticamente
4. Cliente recebe email profissional com:
   - ✅ Confirmação do cadastro
   - 📋 Resumo das informações
   - 📅 Próximos passos
   - ✨ Benefícios da Rastremix
   - 📞 Contato para suporte

### Testar localmente:

```bash
cd supabase
npx supabase functions serve send-email
```

### Custo do Resend:

- **Gratuito:** 100 emails/dia, 3.000/mês
- Para a maioria dos casos, o plano gratuito é suficiente
