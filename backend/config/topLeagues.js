/**
 * config/topLeagues.js
 * Whitelist de ligas exibidas nos Top Picks.
 *
 * Para descobrir o ID de uma liga que ainda não está aqui:
 *   1. Acesse: GET https://v3.football.api-sports.io/fixtures?date=YYYY-MM-DD
 *   2. Logue `f.league.id` + `f.league.name` dos resultados
 *   3. Adicione o ID na lista abaixo e descreva no comentário
 *
 * Referência rápida API-Football league IDs:
 *   39  → Premier League (Inglaterra)
 *  140  → La Liga (Espanha)
 *   78  → Bundesliga (Alemanha)
 *  135  → Serie A (Itália)
 *   61  → Ligue 1 (França)
 *   71  → Série A (Brasil – Brasileirão)
 *    2  → UEFA Champions League
 *    3  → UEFA Europa League
 *  848  → UEFA Conference League
 *   13  → Copa Libertadores
 *   11  → Copa Sudamericana
 *   94  → Primeira Liga (Portugal)
 *   88  → Eredivisie (Holanda)
 *  203  → Süper Lig (Turquia)
 *  253  → MLS (EUA)
 *  262  → Liga MX (México)
 *   15  → FIFA World Cup
 *    1  → World Cup Qualification (geral)
 */

export const TOP_LEAGUE_IDS = new Set([
  // ── Europeias ────────────────────────────────────────
  39,   // Premier League
  140,  // La Liga
  78,   // Bundesliga
  135,  // Serie A (Itália)
  61,   // Ligue 1
  94,   // Primeira Liga
  88,   // Eredivisie
  203,  // Süper Lig

  // ── Sul-americanas / Brasil ──────────────────────────
  71,   // Brasileirão Série A
  13,   // Copa Libertadores
  11,   // Copa Sudamericana

  // ── Competições UEFA ────────────────────────────────
  2,    // Champions League
  3,    // Europa League
  848,  // Conference League

  // ── Américas ────────────────────────────────────────
  253,  // MLS
  262,  // Liga MX

  // ── Mundiais ────────────────────────────────────────
  15,   // FIFA World Cup
  1,    // World Cup Qual. (geral)
]);
