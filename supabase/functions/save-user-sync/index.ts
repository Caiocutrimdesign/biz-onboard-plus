import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Helpers: Saneamento de Dados
 */
const clean = (val: string) => (val ? val.replace(/\D/g, "") : "");

/**
 * Helper: Login na API Legada para obter Sessão
 */
async function loginToRastremix(email: string, password: string) {
  console.log("MCP: Tentando login na Rastremix para:", email);
  try {
    const response = await fetch("https://aplicativo.rastremix.com.br/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Falha no login Rastremix: ${response.status}`);
    }

    const setCookie = response.headers.get("set-cookie");
    if (!setCookie) {
      throw new Error("Não foi possível obter o cookie de sessão da Rastremix.");
    }
    
    // Pegar o primeiro valor do cookie (geralmente o PHPSESSID ou laravel_session)
    return setCookie.split(";")[0];
  } catch (err: any) {
    console.error("Erro no loginToRastremix:", err.message);
    throw err;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const formData = await req.json()
    const { user, vehicles } = formData

    // Sanitização de CPF e Telefone (conforme exigido pela Rastremix)
    const sanitizedUser = { ...user };
    if (sanitizedUser.cpf) sanitizedUser.cpf = clean(sanitizedUser.cpf);
    if (sanitizedUser.celular) sanitizedUser.celular = clean(sanitizedUser.celular);
    if (sanitizedUser.phone) sanitizedUser.phone = clean(sanitizedUser.phone);
    
    console.log("Recebendo solicitação para criar usuário:", user.login_email);
    console.log("CPF Sanitizado:", sanitizedUser.cpf);

    // 1. Salvar no Supabase (Tabela 'usuarios')
    const { data: supabaseUser, error: supabaseError } = await supabaseClient
      .from('usuarios')
      .upsert({
        ...sanitizedUser,
        updated_at: new Date().toISOString()
      }, { onConflict: 'login_email' })
      .select()
      .single()

    if (supabaseError) {
      console.error("Erro ao salvar no Supabase:", supabaseError)
      throw new Error(`Erro ao salvar no Supabase: ${supabaseError.message}`)
    }

    // 2. Sincronizar com a API Legadas Rastremix (Server-side Auth - SILENCIOSA E RESILIENTE)
    let syncStatus = "synced"
    let syncErrorMsg = null

    try {
      const legacyUser = Deno.env.get('LEGACY_USER') || "milenia@facilit.com"
      const legacyPass = Deno.env.get('LEGACY_PASS') || "123456"

      // PASSO A: Login para obter cookie (COM MASCARAMENTO DE USER-AGENT)
      console.log("Tentando login com disfarce de navegador...");
      const loginResponse = await fetch("https://aplicativo.rastremix.com.br/auth/login", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        },
        body: JSON.stringify({ email: legacyUser, password: legacyPass }),
      });

      if (!loginResponse.ok) {
        throw new Error(`Login falhou (HTTP ${loginResponse.status})`);
      }

      const setCookie = loginResponse.headers.get("set-cookie");
      const sessionCookie = setCookie ? setCookie.split(";")[0] : null;

      if (!sessionCookie) {
        throw new Error("Cookie não recebido");
      }

      // PASSO B: Sincronizar usuário (COM DISFARCE DE NAVEGADOR)
      const syncResponse = await fetch("https://aplicativo.rastremix.com.br/users/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": sessionCookie,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Referer": "https://aplicativo.rastremix.com.br/"
        },
        body: JSON.stringify({
          ...sanitizedUser,
          vehicles_ids: vehicles || [],
          sync_source: "biz-onboard-plus",
          timestamp: new Date().toISOString()
        }),
      })

      if (!syncResponse.ok) {
        const errorData = await syncResponse.text()
        console.warn("API Rastremix rejeitou (Silencioso):", syncResponse.status, errorData)
        syncStatus = "pending"
        syncErrorMsg = `Erro ${syncResponse.status}: ${errorData.substring(0, 50)}`
      }
    } catch (err: any) {
      console.warn("Erro na sincronia silenciada:", err.message)
      syncStatus = "pending"
      syncErrorMsg = err.message
    }

    // 3. Atualizar Status no Banco (Audit Column)
    await supabaseClient
      .from('usuarios')
      .update({ 
        sync_status: syncStatus,
        status_sincronia: syncStatus === "pending" ? 'falha_api_legada' : 'sincronizado',
        erro_log: syncErrorMsg 
      })
      .eq('login_email', user.login_email)

    // 4. RETORNO IMEDIATO DE SUCESSO (O FRONT-END LIBERA O USO)
    return new Response(
      JSON.stringify({
        success: true,
        message: "Usuário liberado com sucesso!",
        sync: { status: syncStatus }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Erro crítico na Edge Function:", error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
