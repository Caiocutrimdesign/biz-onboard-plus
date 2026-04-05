import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RASTREMIX_COOKIE = Deno.env.get("RASTREMIX_COOKIE") ?? ""; // Legado (Fleet Sync)

/**
 * CONFIGURAÇÕES DEFINITIVAS - ESPELHAMENTO RASTREMIX
 */
const RASTREMIX_BASE_URL = "https://aplicativo.rastremix.com.br";
const FIXED_TOKEN = "9NqMbyS329Ikf0sGdawZzILqJlPMAGsWT9EiZH1s"; // Token capturado em tempo real (05/04)

/**
 * GMP: Address Validation & Geocoding
 */
async function validateAddress(zip: string, number: string, address: string) {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) return null;
  const query = `${address}, ${number}, ${zip}, Brazil`;
  try {
    const res = await fetch(`https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: { addressLines: [query] } })
    });
    const data = await res.json();
    const location = data.result?.geocode?.location;
    return location ? { lat: location.latitude, lng: location.longitude } : null;
  } catch (err: any) {
    console.error("Erro GMP:", err.message);
    return null;
  }
}

/**
 * GMP: Distance Matrix (Vale/Equatorial)
 */
async function calculateDistance(lat: number, lng: number, clientName: string) {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) return null;
  const bases = { 'Vale': '-2.5307,-44.2045', 'Equatorial': '-2.5186,-44.2541' };
  const isVale = clientName.toUpperCase().includes('VALE');
  const isEquatorial = clientName.toUpperCase().includes('EQUATORIAL');
  if (!isVale && !isEquatorial) return null;
  const dest = isVale ? bases.Vale : bases.Equatorial;
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${dest}&key=${apiKey}`);
    const data = await res.json();
    return (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') 
      ? data.rows[0].elements[0].distance.value / 1000 : null;
  } catch { return null; }
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { type = 'fleet', user_data } = body;

    // --- MODO 1: SINCRONIZAÇÃO DE FROTA (FLEET) ---
    if (type === 'fleet') {
      console.log("Iniciando captura de frota Rastremix...");
      
      const response = await fetch(`${RASTREMIX_BASE_URL}/objects/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": RASTREMIX_COOKIE,
        },
        body: JSON.stringify({ size: 1500, filter_by: "device" }),
      });

      if (!response.ok) throw new Error(`Erro API Rastremix: ${response.status}`);
      const data = await response.json();
      const items = data.items || [];
      
      const veiculos = items.map((carro: any) => ({
        id_rastremix: carro.id.toString(),
        placa: carro.name,
        latitude: parseFloat(carro.lat),
        longitude: parseFloat(carro.lng),
        velocidade: parseFloat(carro.speed) || 0,
        ignicao: !!carro.online,
        ultima_atualizacao: new Date().toISOString(),
      }));

      const { error: upsertError } = await supabase
        .from("frota_veiculos")
        .upsert(veiculos, { onConflict: "id_rastremix" });

      if (upsertError) throw upsertError;

      return new Response(JSON.stringify({ success: true, count: veiculos.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // --- MODO 2: ESPELHAMENTO DEFINITIVO DE CADASTRO (REGISTER) ---
    if (type === 'register' && user_data) {
      console.log("Iniciando Mirror Sync nativo para:", user_data.login_email);
      
      // 1. Inteligência Geográfica
      let lat = null, lng = null, dist = null;
      if (user_data.zip_code || user_data.address) {
        const geo = await validateAddress(user_data.zip_code || "", user_data.address_number || "", user_data.address || "");
        if (geo) {
          lat = geo.lat; lng = geo.lng;
          dist = await calculateDistance(lat, lng, user_data.full_name || "");
        }
      }

      // 2. Salvamento Local (Supabase)
      const { error: dbError } = await supabase.from('usuarios').upsert({
        ...user_data,
        latitude: lat,
        longitude: lng,
        distance_to_base: dist,
        sync_status: 'pending',
        updated_at: new Date().toISOString()
      }, { onConflict: 'login_email' });

      if (dbError) throw dbError;

      // 3. Sync Externo (Rastremix Mirror)
      const mirrorPayload = new URLSearchParams();
      mirrorPayload.append('_token', FIXED_TOKEN);
      mirrorPayload.append('fakeusernameremembered', '');
      mirrorPayload.append('fakepasswordremembered', '');
      mirrorPayload.append('active', '1');
      mirrorPayload.append('group_id', '2');
      mirrorPayload.append('manager_id', '96833');
      mirrorPayload.append('bin_admin_flags', '0');
      mirrorPayload.append('bin_admin_flags', '1');
      mirrorPayload.append('bin_permissions', '-1');
      mirrorPayload.append('template_bin_permissions', '-1');
      
      mirrorPayload.append('client_name', user_data.full_name || "");
      mirrorPayload.append('email', user_data.login_email || "");
      mirrorPayload.append('email_cobranca', user_data.login_email || "");
      mirrorPayload.append('client_login', user_data.login_email || "");
      mirrorPayload.append('client_tab_client_email', user_data.login_email || "");
      mirrorPayload.append('client_tab_client_cpf', (user_data.cpf || user_data.document || "").replace(/\D/g, ""));
      mirrorPayload.append('password', user_data.password || "");
      mirrorPayload.append('password_confirmation', user_data.password || "");
      mirrorPayload.append('client_pass', user_data.password || "");
      mirrorPayload.append('data_de_vencimento', (user_data.due_day || 14).toString());
      
      mirrorPayload.append('client_tab_client_postal_code', user_data.zip_code?.replace(/\D/g, "") || "");
      mirrorPayload.append('client_tab_client_address', user_data.address || "");
      mirrorPayload.append('client_tab_client_address_number', user_data.address_number || "");
      mirrorPayload.append('client_tab_client_address_bairro', user_data.neighborhood || "");
      mirrorPayload.append('client_tab_client_address_city', user_data.city || "");
      mirrorPayload.append('client_tab_client_address_state', user_data.state || "");
      mirrorPayload.append('tel_cel', (user_data.celular || user_data.phone || "").replace(/\D/g, ""));
      
      const perms = ['devices', 'alerts', 'geofences', 'reports', 'send_command', 'history', 'sharing'];
      perms.forEach(mod => ['view', 'edit', 'remove'].forEach(act => mirrorPayload.append(`perms[${mod}][${act}]`, '1')));

      let syncStatus = "synced", syncError = null;
      try {
        const syncRes = await fetch(`${RASTREMIX_BASE_URL}/admin/clients`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": RASTREMIX_COOKIE,
            "X-Requested-With": "XMLHttpRequest",
            "Referer": `${RASTREMIX_BASE_URL}/admin/users/clients`
          },
          body: mirrorPayload
        });
        
        if (!syncRes.ok) {
          const errorText = await syncRes.text();
          throw new Error(`HTTP ${syncRes.status}: ${errorText.substring(0, 100)}`);
        }
      } catch (e: any) {
        console.error("Erro no Espelhamento:", e.message);
        syncStatus = "error";
        syncError = e.message;
      }

      await supabase.from('usuarios').update({ sync_status: syncStatus, erro_log: syncError }).eq('login_email', user_data.login_email);
      
      return new Response(JSON.stringify({ success: true, message: "Cadastro e Sync Nativo OK" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    throw new Error("Tipo de operação inválido.");

  } catch (error) {
    console.error("Erro na sincronização:", error.message);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
