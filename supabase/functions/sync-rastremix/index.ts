import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RASTREMIX_COOKIE = Deno.env.get("RASTREMIX_COOKIE") ?? "";

const RASTREMIX_URL = "https://aplicativo.rastremix.com.br/objects/items";

Deno.serve(async (req) => {
  // Apenas aceitar chamadas autorizadas ou manuais para teste
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Iniciando captura de posições Rastremix...");

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
        s: "",
        size: 2000,
        filter_by: "device",
        orderBy: "name_az",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API Rastremix: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const items = data.items || [];

    console.log(`Capturados ${items.length} itens. Processando upsert...`);

    // Mapear para o formato da nossa tabela 'veiculos_tracking'
    const veiculos = items.map((carro: any) => ({
      id_remoto: carro.id.toString(),
      placa: carro.name,
      lat: parseFloat(carro.lat),
      lng: parseFloat(carro.lng),
      velocidade: parseFloat(carro.speed) || 0,
      ignicao: !!carro.online,
      updated_at: new Date().toISOString(),
    }));

    // Realizar upsert (insere novos ou atualiza existentes pela id_remoto)
    const { error: upsertError } = await supabase
      .from("veiculos_tracking")
      .upsert(veiculos, { onConflict: "id_remoto" });

    if (upsertError) {
      throw upsertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sincronização concluída com sucesso: ${veiculos.length} veículos atualizados.`,
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
