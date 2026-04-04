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

    // Sanitização Básica
    const sanitizedUser = { ...user };
    if (sanitizedUser.cpf) sanitizedUser.cpf = clean(sanitizedUser.cpf);
    if (sanitizedUser.celular) sanitizedUser.celular = clean(sanitizedUser.celular);
    if (sanitizedUser.phone) sanitizedUser.phone = clean(sanitizedUser.phone);

    console.log("Recebendo Matrícula Local:", user.login_email);

    // 1. SALVAMENTO IMEDIATO NO SUPABASE (PRIORIDADE ZERO)
    const { data: supabaseUser, error: supabaseError } = await supabaseClient
      .from('usuarios')
      .upsert({
        ...sanitizedUser,
        sync_status: 'pending',
        updated_at: new Date().toISOString()
      }, { onConflict: 'login_email' })
      .select()
      .single()

    if (supabaseError) {
      console.error("Erro Crítico Supabase:", supabaseError)
      throw new Error(`Erro ao salvar no Supabase: ${supabaseError.message}`)
    }

    // 2. SINCRONIA SILENCIOSA (MIRA O NAVEGADOR REAL)
    let syncStatus = "synced"
    let syncErrorMsg = null

    try {
      const email = Deno.env.get('LEGACY_USER') || "melinia@facilit.com";
      const pass = Deno.env.get('LEGACY_PASS') || "123456";

      // A: Obter Sessão (Form-URL-Encoded)
      const loginPayload = new URLSearchParams();
      loginPayload.append('email', email);
      loginPayload.append('password', pass);

      const loginRes = await fetch("https://aplicativo.rastremix.com.br/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
          "Referer": "https://aplicativo.rastremix.com.br/admin/users/clients"
        },
        body: loginPayload
      });

      const setCookie = loginRes.headers.get("set-cookie");
      const sessionCookie = setCookie ? setCookie.split(";")[0] : null;

      if (sessionCookie) {
        // B: Enviar Cadastro (ESPELHAMENTO DE TRAFEGO REAL)
        const syncPayload = new URLSearchParams();
        
        // Mapeamento de Campos Rastremix
        syncPayload.append('client_name', sanitizedUser.full_name || "");
        syncPayload.append('client_login', sanitizedUser.login_email || "");
        syncPayload.append('client_pass', sanitizedUser.password || "");
        syncPayload.append('client_tab_client_document', sanitizedUser.cpf || sanitizedUser.document || "");
        syncPayload.append('client_tab_client_email', sanitizedUser.login_email || "");
        syncPayload.append('client_tab_client_postal_code', sanitizedUser.zip_code || "");
        syncPayload.append('client_tab_client_address', sanitizedUser.address || "");
        syncPayload.append('client_tab_client_number', sanitizedUser.address_number || "");
        syncPayload.append('client_tab_client_city', sanitizedUser.city || "");
        syncPayload.append('client_tab_client_state', sanitizedUser.state || "");
        syncPayload.append('client_tab_client_cell_phone', sanitizedUser.celular || sanitizedUser.cellphone || "");
        
        // Permissões Padrão (Conforme curl 2)
        const perms = ['devices', 'alerts', 'cercas', 'relatorios', 'comandos', 'compartilhar_localizacao'];
        perms.forEach(p => {
          syncPayload.append(`perms[${p}][view]`, '1');
          syncPayload.append(`perms[${p}][edit]`, '1');
          syncPayload.append(`perms[${p}][delete]`, '1');
        });

        const syncRes = await fetch("https://aplicativo.rastremix.com.br/admin/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": sessionCookie,
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
            "Referer": "https://aplicativo.rastremix.com.br/admin/users/clients"
          },
          body: syncPayload
        });

        if (!syncRes.ok) {
          syncStatus = "error";
          syncErrorMsg = `Rastremix HTTP ${syncRes.status}`;
        }
      } else {
        syncStatus = "error";
        syncErrorMsg = "Falha na Sessão Legada";
      }
    } catch (err: any) {
      syncStatus = "error";
      syncErrorMsg = err.message;
    }

    // 3. Atualizar Status de Auditoria
    await supabaseClient
      .from('usuarios')
      .update({ sync_status: syncStatus, erro_log: syncErrorMsg })
      .eq('login_email', user.login_email)

    // 4. RETORNO DE SUCESSO (LIBERA O ARNALDO)
    return new Response(
      JSON.stringify({ success: true, message: "Operador Matrículado no Supabase!" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Critical Error:", error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
