import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RASTREMIX_COOKIE = Deno.env.get("RASTREMIX_COOKIE") ?? "";

const RASTREMIX_URL = "https://aplicativo.rastremix.com.br/objects/items";

Deno.serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Iniciando captura de frota Rastremix...");

    if (!RASTREMIX_COOKIE) {
      throw new Error("RASTREMIX_COOKIE não configurado nas Secrets do Supabase.");
    }

    const response = await fetch(RASTREMIX_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": RASTREMIX_COOKIE,
      },
      body: JSON.stringify({
        size: 1500,
        filter_by: "device",
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API Rastremix: ${response.status}`);
    }

    const data = await response.json();
    const items = data.items || [];

    console.log(`Capurados ${items.length} itens. Sincronizando...`);

    // Mapear para o formato da sua nova tabela 'frota_veiculos'
    const veiculos = items.map((carro: any) => ({
      id_rastremix: carro.id.toString(),
      placa: carro.name,
      latitude: parseFloat(carro.lat),
      longitude: parseFloat(carro.lng),
      velocidade: parseFloat(carro.speed) || 0,
      ignicao: !!carro.online,
      ultima_atualizacao: new Date().toISOString(),
    }));

    // Realizar upsert em 'frota_veiculos'
    const { error: upsertError } = await supabase
      .from("frota_veiculos")
      .upsert(veiculos, { onConflict: "id_rastremix" });

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sincronização concluída: ${veiculos.length} veículos na frota.`,
        count: veiculos.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro na sincronização:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
