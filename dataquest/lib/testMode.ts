/**
 * Modo Teste (`npm run teste`): só no computador de quem desenvolve, nunca no site publicado.
 * Todas as fases ficam abertas, não há conta/nuvem/ranking e aparece o painel 🧪 para pular entre fases.
 * Depende de `next dev` (NODE_ENV !== "production"), então um build de produção nunca o liga.
 */
export const TEST_MODE =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_MODO_TESTE === "1";
