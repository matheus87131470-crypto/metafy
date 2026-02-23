/**
 * config/topLeagues.js
 * Curadoria de ligas para o /api/matches/today.
 * Matching por { country, name } — case-insensitive, trim.
 *
 * COMO CALIBRAR:
 *   Após a Render subir, procure no log a linha [LIGAS DO DIA]:
 *   Ex: "39:Premier League (England) | 71:Série A (Brazil) | ..."
 *   Se a grafia de country/name for diferente do esperado, ajuste aqui.
 *
 * NOTA: "Serie A" existe no Brasil (Brasileirão) e na Itália.
 *   Diferenciar pelo country: "Brazil" vs "Italy".
 */

// ─── PRATELEIRA 1 ─────────────────────────────────────────────────────────────
// Ligas que SEMPRE queremos mostrar quando houver jogos.
// Matching por { country, name } — case-insensitive.
const TIER_1_LIST = [
  // UEFA / Competições mundiais de clubes
  { country: 'World', name: 'UEFA Champions League' },
  { country: 'World', name: 'UEFA Europa League' },
  { country: 'World', name: 'UEFA Europa Conference League' },
  { country: 'World', name: 'CONMEBOL Libertadores' },
  { country: 'World', name: 'CONMEBOL Sudamericana' },

  // Big-5 europeus
  { country: 'England',     name: 'Premier League' },
  { country: 'Spain',       name: 'La Liga' },
  { country: 'Italy',       name: 'Serie A' },
  { country: 'Germany',     name: 'Bundesliga' },
  { country: 'France',      name: 'Ligue 1' },

  // Brasil
  { country: 'Brazil', name: 'Serie A' },       // Brasileirão — country diferencia de Itália
  { country: 'Brazil', name: 'Copa Do Brasil' }, // case-insensitive cobre variações
  { country: 'Brazil', name: 'Copa do Brasil' },

  // Oriente Médio
  { country: 'Saudi Arabia', name: 'Saudi Pro League' },
];

// ─── PRATELEIRA 2 ─────────────────────────────────────────────────────────────
// Preenchimento quando TIER_1 retorna < 10 jogos no dia.
const TIER_2_LIST = [
  { country: 'Netherlands', name: 'Eredivisie' },
  { country: 'Portugal',    name: 'Primeira Liga' },
  { country: 'Turkey',      name: 'Süper Lig' },
  { country: 'Argentina',   name: 'Liga Profesional' },
  { country: 'Mexico',      name: 'Liga MX' },
  { country: 'USA',         name: 'MLS' },
  { country: 'Brazil',      name: 'Serie B' },
  { country: 'Scotland',    name: 'Premiership' },
  { country: 'Germany',     name: 'DFB Pokal' },
  { country: 'Italy',       name: 'Coppa Italia' },
  { country: 'Spain',       name: 'Copa del Rey' },
  { country: 'France',      name: 'Coupe de France' },
  { country: 'World',       name: 'UEFA Nations League' },
  { country: 'World',       name: 'World Cup' },
  { country: 'World',       name: 'Copa America' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Normaliza string para comparação (lower-case, sem espaços extras). */
const norm = s => (s || '').toLowerCase().trim();

/**
 * Retorna o tier da liga (1, 2 ou null = ignorar).
 * @param {string} country  - f.league.country da API-Football
 * @param {string} name     - f.league.name da API-Football
 */
export function leagueTier(country, name) {
  const c = norm(country);
  const n = norm(name);
  if (TIER_1_LIST.some(e => norm(e.country) === c && norm(e.name) === n)) return 1;
  if (TIER_2_LIST.some(e => norm(e.country) === c && norm(e.name) === n)) return 2;
  return null;
}

// ─── TOP_LEAGUE_IDS (Set de IDs numéricos) ────────────────────────────────────
// Exportado para compatibilidade com top-picks.js (usa .has()).
// IDs confirmados via API-Football.
export const TOP_LEAGUE_IDS = new Set([
  // Tier 1 — prateleira principal
  2,    // UEFA Champions League
  3,    // UEFA Europa League
  848,  // UEFA Europa Conference League
  13,   // CONMEBOL Libertadores
  11,   // CONMEBOL Sudamericana
  39,   // Premier League
  140,  // La Liga
  135,  // Serie A (Itália)
  78,   // Bundesliga
  61,   // Ligue 1
  71,   // Brasileirão Série A
  73,   // Copa do Brasil
  307,  // Saudi Pro League (confirmar via [LIGAS DO DIA])

  // Tier 2 — segunda prateleira
  88,   // Eredivisie
  94,   // Primeira Liga
  203,  // Süper Lig
  128,  // Liga Profesional (Argentina)
  262,  // Liga MX
  253,  // MLS
  72,   // Brasileirão Série B
  34,   // Scottish Premiership
  81,   // DFB Pokal
  137,  // Coppa Italia
  141,  // Copa del Rey
  65,   // Coupe de France
  5,    // UEFA Nations League
  15,   // FIFA World Cup
  9,    // Copa America
]);
