/**
 * routes/matches-today.js
 * Endpoint Express para buscar partidas agendadas de hoje (SportAPI7)
 * Suporta override de data via query: ?date=YYYY-MM-DD
 * Retorna apenas as TOP 6 ligas principais do mundo
 * Suporta modo debug: ?debug=1
 */

import rapidApiClient from '../services/rapidapi-client.js';

// Cache diário - atualiza apenas quando muda o dia
let dailyCache = null;
let lastFetchDate = null;

// Ligas domésticas TOP com validação de país
const DOMESTIC_LEAGUES = new Map([
  ['premier-league', ['England', 'United Kingdom', 'UK']],
  ['laliga', ['Spain']],
  ['serie-a', ['Italy']],
  ['bundesliga', ['Germany']],
  ['ligue-1', ['France']],
  ['brasileirao-serie-a', ['Brazil', 'Brasil']]
]);

// Competições internacionais (multipaises - sem validação de país)
const INTERNATIONAL_COMPETITIONS = new Set([
  'uefa-champions-league',
  'champions-league',
  'uefa-europa-league',
  'europa-league',
  'uefa-conference-league',
  'conference-league',
  'copa-libertadores',
  'libertadores',
  'copa-sudamericana',
  'sudamericana',
  'fifa-club-world-cup',
  'world-cup',
  'copa-america',
  'euro',
  'uefa-nations-league',
  'nations-league'
]);

// Copas nacionais importantes
const NATIONAL_CUPS = new Map([
  ['fa-cup', ['England', 'United Kingdom', 'UK']],
  ['copa-del-rey', ['Spain']],
  ['coppa-italia', ['Italy']],
  ['dfb-pokal', ['Germany']],
  ['coupe-de-france', ['France']],
  ['copa-do-brasil', ['Brazil', 'Brasil']]
]);

/**
 * Verificar se uma partida é de uma competição permitida
 * Valida SLUG + PAÍS (para domésticas) ou só SLUG (para internacionais)
 */
function isAllowed(match) {
  const slug = (match.leagueSlug || '').toLowerCase().trim();
  const name = (match.league || '').toLowerCase();
  const country = (match.country || '').trim();
  
  if (!slug) return false;

  // Bloqueios extras (segurança)
  if (name.includes('women') || name.includes('fem') || name.includes('frauen')) return false;
  if (name.includes('u21') || name.includes('u20') || name.includes('u19') || name.includes('youth')) return false;
  if (name.includes('u-21') || name.includes('u-20') || name.includes('u-19')) return false;
  
  // Bloquear segunda divisão EXCETO se for copa ou competição internacional
  const isCompetition = INTERNATIONAL_COMPETITIONS.has(slug) || NATIONAL_CUPS.has(slug);
  if (!isCompetition && (name.includes('2') || slug.includes('2'))) return false;

  // 1) Competições internacionais (não precisa validar país)
  if (INTERNATIONAL_COMPETITIONS.has(slug)) return true;

  // 2) Ligas domésticas (precisa validar país)
  if (DOMESTIC_LEAGUES.has(slug)) {
    if (!country) return false;
    const validCountries = DOMESTIC_LEAGUES.get(slug);
    return validCountries.some(validCountry => 
      country.toLowerCase().includes(validCountry.toLowerCase())
    );
  }

  // 3) Copas nacionais (precisa validar país)
  if (NATIONAL_CUPS.has(slug)) {
    if (!country) return false;
    const validCountries = NATIONAL_CUPS.get(slug);
    return validCountries.some(validCountry => 
      country.toLowerCase().includes(validCountry.toLowerCase())
    );
  }

  return false;
}

/**
 * Filtrar partidas usando whitelist restrita
 */
function filterMajorLeagues(matches, debugMode = false) {
  const dropped = [];
  const kept = [];
  
  const filtered = matches.filter(match => {
    const allowed = isAllowed(match);
    
    if (debugMode) {
      const sample = {
        country: match.country,
        league: match.league,
        leagueSlug: match.leagueSlug
      };
      
      if (allowed && kept.length < 10) {
        kept.push(sample);
      } else if (!allowed && dropped.length < 10) {
        dropped.push(sample);
      }
    }
    
    return allowed;
  });
  
  return { filtered, dropped, kept };
}

/**
 * Ordenar partidas por status (live > notstarted > finished) e depois por kickoff
 */
function sortMatches(matches) {
  const statusRank = {
    'live': 0,
    'inprogress': 0,
    'notstarted': 1,
    'scheduled': 1,
    'finished': 2,
    'ended': 2,
    'canceled': 3,
    'postponed': 3,
    'unknown': 4
  };

  return matches.sort((a, b) => {
    // Primeiro: ordenar por status
    const rankA = statusRank[a.status] ?? 99;
    const rankB = statusRank[b.status] ?? 99;
    
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    
    // Segundo: ordenar por kickoff (ascendente)
    if (!a.kickoff) return 1;
    if (!b.kickoff) return -1;
    const timeA = new Date(a.kickoff).getTime();
    const timeB = new Date(b.kickoff).getTime();
    return timeA - timeB;
  });
}

const handler = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Modo debug
    const debugMode = req.query.debug === '1';
    
    // Permitir override de data via query string
    let customDate = null;
    if (req.query.date) {
      // Validar formato YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(req.query.date)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de data inválido. Use YYYY-MM-DD'
        });
      }
      customDate = req.query.date;
      console.log('📅 Data customizada recebida:', customDate);
    }

    const dateStr = customDate || new Date().toISOString().split('T')[0];
    console.log('🔄 GET /api/matches/today');
    console.log('   📅 Data para busca:', dateStr);
    
    // Verificar cache diário (apenas para data de hoje, sem debug)
    if (!customDate && !debugMode && dailyCache && lastFetchDate === dateStr) {
      console.log('🟢 Retornando dados do cache diário');
      return res.json(dailyCache);
    }
    
    // Buscar dados reais (já tem cache de 60s embutido se não for customDate)
    let matches = await rapidApiClient.getTodayMatches(customDate);
    const totalBeforeFilter = matches.length;
    
    // Filtrar apenas ligas principais (com amostras para debug)
    const { filtered, dropped, kept } = filterMajorLeagues(matches, debugMode);
    matches = filtered;
    const totalAfterFilter = matches.length;
    
    if (debugMode) {
      console.log(`📊 DEBUG: Total antes do filtro: ${totalBeforeFilter}`);
      console.log(`🎯 DEBUG: Total após filtro: ${totalAfterFilter}`);
      console.log(`❌ DEBUG: Dropped sample:`, dropped);
      console.log(`✅ DEBUG: Kept sample:`, kept);
    }
    
    // Ordenar por status e kickoff
    matches = sortMatches(matches);
    
    const response = {
      success: true,
      count: matches.length,
      date: dateStr,
      matches
    };

    // Adicionar info de debug se solicitado
    if (debugMode) {
      response.debug = {
        totalBeforeFilter,
        totalAfterFilter,
        droppedSample: dropped,
        keptSample: kept
      };
    }
    
    // Atualizar cache diário (apenas para data de hoje, sem debug)
    if (!customDate && !debugMode) {
      dailyCache = response;
      lastFetchDate = dateStr;
      console.log('💾 Cache diário atualizado para', dateStr);
    }
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Erro ao buscar partidas:', error.message);
    console.error('❌ Stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar partidas',
      message: error.message
    });
  }
};

export default handler;
