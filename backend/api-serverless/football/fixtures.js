/**
 * API Route: /api/football/fixtures
 * Consome API-Football para buscar próximas partidas
 * 
 * @see https://www.api-football.com/documentation-v3
 */

module.exports = async function handler(req, res) {
  // Apenas GET permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // Verificar se API key está configurada
  const apiKey = process.env.API_FOOTBALL_KEY;
  
  if (!apiKey) {
    console.error('❌ API_FOOTBALL_KEY não configurada nas variáveis de ambiente');
    return res.status(500).json({
      success: false,
      error: 'API key not configured',
      message: 'Configure API_FOOTBALL_KEY nas variáveis de ambiente da Vercel'
    });
  }

  try {
    // Parâmetros da query (opcional)
    const { next = 10, league, date, live } = req.query;
    
    // Construir URL base
    let apiUrl = 'https://v3.football.api-sports.io/fixtures';
    const params = new URLSearchParams();
    
    // Adicionar parâmetros
    if (live === 'true' || live === 'all') {
      params.append('live', 'all');
    } else if (date) {
      params.append('date', date);
    } else {
      params.append('next', next);
    }
    
    if (league) {
      params.append('league', league);
    }
    
    const fullUrl = `${apiUrl}?${params.toString()}`;
    console.log(`📡 Fetching: ${fullUrl}`);

    // Fazer requisição para API-Football
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey
      }
    });

    // Log do status
    console.log(`📊 API Response Status: ${response.status}`);

    // Verificar se resposta foi ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      
      return res.status(response.status).json({
        success: false,
        error: `API returned ${response.status}`,
        message: errorText
      });
    }

    // Parsear JSON
    const data = await response.json();
    
    // Verificar erros na resposta da API
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('❌ API Errors:', data.errors);
      return res.status(400).json({
        success: false,
        error: 'API returned errors',
        errors: data.errors
      });
    }

    // Log de sucesso
    const fixturesCount = data.response?.length || 0;
    console.log(`✅ Success: ${fixturesCount} fixtures returned`);

    // Retornar dados
    return res.status(200).json({
      success: true,
      results: data.results,
      fixtures: data.response,
      paging: data.paging
    });

  } catch (error) {
    console.error('❌ Server Error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
