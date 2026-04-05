# Instruções de Sincronia Rastremix (Definitive Mirror)

Este documento descreve o funcionamento da sincronia entre este sistema (Supabase) e a plataforma legada da Rastremix.

## Arquitetura de Sincronia
Para garantir a compatibilidade com a API legada e contornar problemas de validação de sessão, utilizamos uma estratégia de **Mirroring (Espelhamento)**.

1.  **Endpoint**: `https://aplicativo.rastremix.com.br/admin/clients` (POST)
2.  **Formato**: `application/x-www-form-urlencoded`
3.  **Gatilho**: O formulário de registro chama a Edge Function `sync-rastremix` com o parâmetro `type: 'register'`.

## Estratégia de Mirroring
O sistema simula uma submissão de formulário idêntica à do navegador do administrador, incluindo:
-   **Headers**: Accept, User-Agent e X-Requested-With (XMLHttpRequest).
-   **Cookies**: É essencial manter o `laravel_session` e `remember_web` atualizados nas Secrets do Supabase (`RASTREMIX_COOKIE`).
-   **Tokens**: O `_token` CSRF (`9NqMbyS329Ikf0sGdawZzILqJlPMAGsWT9EiZH1s`) é passado como parte do payload.

## cURL Definitiva de Referência
Sempre que precisar depurar, use esta cURL capturada do ambiente de produção do Arnaldo:

```bash
curl 'https://aplicativo.rastremix.com.br/admin/clients' \
  -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'Cookie: laravel_session=...; remember_web=...' \
  --data-raw '_token=8UefPinuAXg6QJgUygn4gUN618ULTBDBnrdBAR9b&active=1&group_id=2&manager_id=96833&client_name=NOME&email=EMAIL&client_login=LOGIN&client_tab_client_email=EMAIL&client_tab_client_cpf=CPF&password=SENHA&password_confirmation=SENHA&client_pass=SENHA&data_de_vencimento=14&taxa_mensal=49.90&perms[devices][view]=1&perms[devices][edit]=1'
```

## Solução de Problemas (Troubleshooting)
-   **Erro HTTP 500**: Provavelmente o Cookie de sessão expirou ou o CPF/Email já existe na Rastremix.
-   **Campos Reais**: Note que a Rastremix exige campos duplicados (ex: `email`, `client_login` e `client_tab_client_email`) todos com o mesmo valor.
-   **Sanitização**: CPF e Celular devem ser enviados **apenas números** (sem pontos ou traços).

## Monitoramento
Os erros de sincronia são registrados na coluna `erro_log` da tabela `usuarios` no Supabase.
-   Status `pending`: Aguardando sincronia (ou falha crítica).
-   Status `synced`: Sucesso total.
-   Status `error`: Falha reportada pela API legada.
