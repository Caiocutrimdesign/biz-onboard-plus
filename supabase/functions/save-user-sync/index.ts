import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RASTREMIX_API_URL = "https://aplicativo.rastremix.com.br/users/save"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log("Recebendo solicitação para criar usuário:", user.login_email)

    // 1. Salvar no Supabase (Tabela 'usuarios')
    const { data: supabaseUser, error: supabaseError } = await supabaseClient
      .from('usuarios')
      .upsert({
        ...user,
        updated_at: new Date().toISOString()
      }, { onConflict: 'login_email' })
      .select()
      .single()

    if (supabaseError) {
      console.error("Erro ao salvar no Supabase:", supabaseError)
      throw new Error(`Erro ao salvar no Supabase: ${supabaseError.message}`)
    }

    console.log("Usuário salvo com sucesso no Supabase.")

    // 2. Sincronizar com a API Legada Rastremix
    let syncStatus = "success"
    let syncErrorMsg = null

    try {
      const apiKey = Deno.env.get('RASTREMIX_API_KEY')
      if (!apiKey) {
        throw new Error("RASTREMIX_API_KEY não configurada no Supabase Secrets.")
      }

      console.log("Iniciando sincronia com API Rastremix...")
      
      const syncResponse = await fetch(RASTREMIX_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          ...user,
          vehicles_ids: vehicles || [] // Array de IDs de veículos selecionados
        }),
      })

      if (!syncResponse.ok) {
        const errorData = await syncResponse.text()
        console.error("Falha na sincronia API Rastremix:", syncResponse.status, errorData)
        syncStatus = "failed"
        syncErrorMsg = `API Rastremix retornou status ${syncResponse.status}`
      } else {
        console.log("Sincronia com API Rastremix concluída com sucesso.")
      }
    } catch (err) {
      console.error("Erro durante a sincronia:", err.message)
      syncStatus = "failed"
      syncErrorMsg = err.message
    }

    // 3. Retornar resposta combinada
    return new Response(
      JSON.stringify({
        success: true,
        supabaseUser,
        sync: {
          status: syncStatus,
          message: syncErrorMsg || "Sincronizado com sucesso."
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error("Erro crítico na Edge Function:", error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
