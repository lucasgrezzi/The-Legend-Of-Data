import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cliente do Supabase (contas + ranking). null quando as variáveis de ambiente não estão
 * configuradas — o jogo continua funcionando só com o localStorage e a UI de conta some.
 */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
