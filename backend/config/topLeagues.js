/**
 * config/topLeagues.js
 * Curadoria de ligas para o /api/matches/today.
 *
 * TIER_1 — Prateleira principal (exibidos com prioridade máxima)
 * TIER_2 — Segunda prateleira (preenchimento quando TIER_1 < 10 jogos no dia)
 *
 * Como descobrir IDs de novas ligas:
 *   • O endpoint /api/matches/today loga TODOS os league.id + league.name
 *     do dia no console da Render → procure "[LIGAS DO DIA]".
 *   • Ou acesse: https://api-football-v1.p.rapidapi.com/v3/leagues?search=nome
 */

// ─── PRATELEIRA 1 ─────────────────────────────────────────────────────────────
// Ligas e competições que SEMPRE queremos mostrar quando houver jogos.
export const TIER_1 = new Set([
  // UEFA / Clubes europeus
  2,    // Champions League
  3,    // Europa League
  848,  // Conference League

  // Big-5 europeus
  39,   // Premier League (Inglaterra)
  140,  // La Liga (Espanha)
  78,   // Bundesliga (Alemanha)
  135,  // Serie A (Itália)
  61,   // Ligue 1 (França)

  // Brasil
  71,   // Brasileirão Série A
  73,   // Copa do Brasil
  13,   // CONMEBOL Libertadores
  11,   // CONMEBOL Sudamericana

  // Estaduais brasileiros principais
  268,  // Campeonato Paulista  (verificar via log se o ID bater)
  351,  // Campeonato Carioca   (verificar via log)
  475,  // Campeonato Mineiro   (verificar via log)
  479,  // Campeonato Gaúcho    (verificar via log)

  // Seleções / Mundiais
  15,   // FIFA World Cup
  4,    // UEFA Euro Championship
  9,    // Copa América
  1,    // World Cup Qualification
]);

// ─── PRATELEIRA 2 ─────────────────────────────────────────────────────────────
// Preenchimento quando TIER_1 retorna < 10 jogos no dia.
// Ligas sólidas mas de segundo alcance para o público-alvo.
export const TIER_2 = new Set([
  94,   // Primeira Liga (Portugal)
  88,   // Eredivisie (Holanda)
  128,  // Liga Profesional (Argentina)
  203,  // Süper Lig (Turquia)
  262,  // Liga MX (México)
  253,  // MLS (EUA)
  34,   // Scottish Premiership
  72,   // Brasileirão Série B
  81,   // DFB-Pokal (Alemanha)
  137,  // Coppa Italia
  141,  // Copa del Rey (Espanha)
  65,   // Coupe de France
  3,    // (já em tier1, duplicata segura no Set)
  5,    // UEFA Nations League
  10,   // Friendlies (Internacionais)
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Retorna o tier do jogo (1, 2 ou null = ignorar). */
export function leagueTier(leagueId) {
  if (TIER_1.has(leagueId)) return 1;
  if (TIER_2.has(leagueId)) return 2;
  return null;
}
