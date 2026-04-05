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
 * GMP: Address Validation & Geocoding
 */
async function validateAddress(zip: string, number: string, address: string) {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) {
    console.warn("GMP: GOOGLE_MAPS_API_KEY não configurada.");
    return null;
  }

  const query = `${address}, ${number}, ${zip}, Brazil`;
  try {
    const res = await fetch(`https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: { addressLines: [query] }
      })
    });

    if (!res.ok) throw new Error(`GMP HTTP ${res.status}`);
    const data = await res.json();
    
    // Extrai Coordenadas
    const location = data.result?.geocode?.location;
    return location ? { lat: location.latitude, lng: location.longitude } : null;
  } catch (err) {
    console.error("Erro GMP Address Validate:", err.message);
    return null;
  }
}

/**
 * GMP: Distance Matrix (Logística Vale/Equatorial)
 */
async function calculateDistance(lat: number, lng: number, clientName: string) {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) return null;

  // Bases Operacionais (Padrão Paço do Lumiar/SLZ)
  const bases = {
    'Vale': '-2.5307,-44.2045',
    'Equatorial': '-2.5186,-44.2541'
  };

  const isVale = clientName.toUpperCase().includes('VALE');
  const isEquatorial = clientName.toUpperCase().includes('EQUATORIAL');
  
  if (!isVale && !isEquatorial) return null;
  const destination = isVale ? bases.Vale : bases.Equatorial;

  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${destination}&key=${apiKey}`);
    const data = await res.json();
    
    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const distanceText = data.rows[0].elements[0].distance.text;
      const distanceValue = data.rows[0].elements[0].distance.value / 1000; // km
      return distanceValue;
    }
    return null;
  } catch (err) {
    console.error("Erro GMP Distance Matrix:", err.message);
    return null;
  }
}

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

    // 1. INTELIGÊNCIA GEOGRÁFICA (GMP)
    let latitude = null;
    let longitude = null;
    let distance_to_base = null;

    if (sanitizedUser.zip_code || sanitizedUser.address) {
      const geo = await validateAddress(
        sanitizedUser.zip_code || "",
        sanitizedUser.address_number || "",
        sanitizedUser.address || ""
      );

      if (geo) {
        latitude = geo.lat;
        longitude = geo.lng;
        // Calcula Distância se for Vale/Equatorial
        distance_to_base = await calculateDistance(latitude, longitude, sanitizedUser.full_name || "");
      }
    }

    // 2. SALVAMENTO IMEDIATO NO SUPABASE (PRIORIDADE ZERO)
    const { data: supabaseUser, error: supabaseError } = await supabaseClient
      .from('usuarios')
      .upsert({
        ...sanitizedUser,
        latitude,
        longitude,
        distance_to_base,
        sync_status: 'pending',
        updated_at: new Date().toISOString()
      }, { onConflict: 'login_email' })
      .select()
      .single()

    if (supabaseError) {
      console.error("Erro Crítico Supabase:", supabaseError)
      throw new Error(`Erro ao salvar no Supabase: ${supabaseError.message}`)
    }

    // 2. SINCRONIA SILENCIOSA (MODO ESPELHAMENTO DEFINITIVO)
    let syncStatus = "synced"
    let syncErrorMsg = null

    try {
      // DEFINIR PAYLOAD (application/x-www-form-urlencoded)
      const mirrorPayload = new URLSearchParams();
      
      // Dados de Controle e Tokens (Fixos da cURL)
      const FIXED_TOKEN = "8UefPinuAXg6QJgUygn4gUN618ULTBDBnrdBAR9b";
      mirrorPayload.append('_token', FIXED_TOKEN);
      mirrorPayload.append('fakeusernameremembered', '');
      mirrorPayload.append('fakepasswordremembered', '');
      mirrorPayload.append('sync_button_status', '0');
      mirrorPayload.append('data_cpf_cnpj', '');
      mirrorPayload.append('id', '');
      mirrorPayload.append('active', '1');
      mirrorPayload.append('group_id', '2');
      mirrorPayload.append('manager_id', '96833');
      mirrorPayload.append('bin_admin_flags', '0');
      mirrorPayload.append('bin_admin_flags', '1');
      mirrorPayload.append('bin_permissions', '-1');
      mirrorPayload.append('template_bin_permissions', '-1');

      // Mapeamento Dinâmico de Campos (Formulário Novo -> Rastremix Legado)
      mirrorPayload.append('name', ''); // Campo vazio no curl
      mirrorPayload.append('client_name', sanitizedUser.full_name || "");
      mirrorPayload.append('email', sanitizedUser.login_email || "");
      mirrorPayload.append('client_login', sanitizedUser.login_email || "");
      mirrorPayload.append('client_tab_client_email', sanitizedUser.login_email || "");
      mirrorPayload.append('client_tab_client_cpf', sanitizedUser.cpf || sanitizedUser.document || "");
      mirrorPayload.append('password', sanitizedUser.password || "");
      mirrorPayload.append('password_confirmation', sanitizedUser.password || "");
      mirrorPayload.append('client_pass', sanitizedUser.password || "");
      mirrorPayload.append('data_de_vencimento', (sanitizedUser.due_day || 14).toString());
      
      // Endereço e Contato (Opcionais)
      mirrorPayload.append('client_tab_client_postal_code', sanitizedUser.zip_code || "");
      mirrorPayload.append('client_tab_client_address', sanitizedUser.address || "");
      mirrorPayload.append('client_tab_client_address_number', sanitizedUser.address_number || "");
      mirrorPayload.append('client_tab_complemento', sanitizedUser.complement || "");
      mirrorPayload.append('client_tab_client_address_bairro', sanitizedUser.neighborhood || "");
      mirrorPayload.append('client_tab_client_address_city', sanitizedUser.city || "");
      mirrorPayload.append('client_tab_client_address_state', sanitizedUser.state || "");
      mirrorPayload.append('tel_cel', sanitizedUser.celular || sanitizedUser.cellphone || "");
      mirrorPayload.append('taxa_mensal', (sanitizedUser.monthly_value || "").toString());

      // Permissões de Ferro (Exatamente como no curl)
      const permsMap = {
        'devices': ['view', 'edit'],
        'alerts': ['view', 'edit', 'remove'],
        'geofences': ['view', 'edit', 'remove'],
        'reports': ['view', 'edit', 'remove'],
        'send_command': ['view'],
        'history': ['view', 'remove'],
        'sharing': ['view', 'edit', 'remove']
      };

      Object.entries(permsMap).forEach(([mod, actions]) => {
        actions.forEach(act => {
          mirrorPayload.append(`perms[${mod}][${act}]`, '1');
        });
      });

      // Headers e Cookies Oficiais do Arnaldo
      const headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "origin": "https://aplicativo.rastremix.com.br",
        "referer": "https://aplicativo.rastremix.com.br/admin/users/clients",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
        "Cookie": "_ga=GA1.1.750912743.1775263527; remember_web_59ba36addc2b2f9401580f014c7f58ea4e30989d=eyJpdiI6IjREdnZrMFRDRGhGWE1zR0xkNkRKeUE9PSIsInZhbHVlIjoiUzRMNTBOREZCZG03UVZ1QWRIU1VTT0hrSzcyMFhYaFV4U1VpQXpWR1NBSUNzbTk0aUpBbVA0SGIwQUIvRjZrYk5rUHkzUXBRSUgzOHA0cGZBUmtiZkpTQm9Nd21sR2k5NTdZQnppS0hUZmZVanZ5K0dIRUN3d255YjNIZTZqeEZZU0I3OFhoTGRoU25zQUdhQkkzUldsRFplU0Y3cWQ5MnRwZXJaM0cyZmNxeFNlY3h1WEZmaVFKUVMrbHNQajEzTjNoK056T01sa3VNdHdhZGZLS2V6R1NkS3NuSkV0UTRXTW9BK1VIeE0wZz0iLCJtYWMiOiIwYjc0NThkNWQwNGNiZTViZjAyMTg3MWMwNjVkMjdhNWI1NGQzZTY5OTAzODk2NWNjZDA0ODQ5ZDgwNzRiZTI4IiwidGFnIjoiIn0%3D; _ga_7KP7V1FZW3=GS2.1.s1775322699$o7$g1$t1775323243$j60$l0$h0; laravel_session=eyJpdiI6IkNQc2xUVDI3aFhEWkdEelVlTzEyQ3c9PSIsInZhbHVlIjoicFUzb2o4K1ZOY2Z4S2Ivbit5a0xleVdsa2MwSStybEIzRmY2alZSTjB5L1Q4Qm5uYkhFeVVzbHJoZEl0ZlZqejAxTTNjbkxNYmJIc1FIQnZtSThxbGt3K2pXb3dCT21uTm9NcGlvQW1xd0hjUmVsM1BnRnp1RXlqaEE3RXp6K1EiLCJtYWMiOiJlMDc5ZjZlYmI2M2FjZDdkM2I3MmM1YmEyYTNkYTY4OTE3YTdiYjQ5MDY1ZTc5ZTJmZTdjOThlYzViMWVjNTdhIiwidGFnIjoiIn0%3D"
      };

      const syncRes = await fetch("https://aplicativo.rastremix.com.br/admin/clients", {
        method: "POST",
        headers: headers,
        body: mirrorPayload
      });

      if (!syncRes.ok) {
        syncStatus = "error";
        syncErrorMsg = `Rastremix Mirror HTTP ${syncRes.status}`;
        console.warn("Mirror falhou:", await syncRes.text());
      } else {
        console.log("Mirror Definitivo: Sincronização bem-sucedida.");
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

    // 4. RETORNO DE SUCESSO ABSOLUTO (LIBERA O USO)
    return new Response(
      JSON.stringify({ success: true, message: "Cadastro Finalizado!" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error("Critical Error Mirror:", error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
