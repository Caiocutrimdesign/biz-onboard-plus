import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// Essas variáveis devem ser configuradas no seu ambiente (.env)
// Ou use as constantes abaixo se forem públicas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://gkjmfpuaeabmoziyqiag.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdram1mcHVhZWFibW96aXlxaWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzAyNzQsImV4cCI6MjA5MDE0NjI3NH0.e2DDlUbWgvmfWGC39Ts_lcq2O15zrsEvFvl9Q3Amwgk";

/**
 * Cliente Supabase centralizado para todo o sistema.
 * Exportado como 'supabase' conforme solicitado.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
  },
});

// Helper para verificar se a configuração está completa
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey;
};
