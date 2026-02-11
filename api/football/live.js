/**
 * API Route: /api/football/live
 * Busca partidas ao vivo
 */

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  const apiKey = process.env.API_FOOTBALL_KEY;
  
  if (!apiKey) {
    console.error('❌ API_FOOTBALL_KEY não configurada');
    return res.status(500).json({
      success: false,
      error: 'API key not configured'
    });
  }

  try {
    const response = await fetch(
      'https://v3.football.api-sports.io/fixtures?live=all',
      {
        headers: {
          'x-apisports-key': apiKey
        }
      }
    );

    console.log(`📊 Live API Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `API returned ${response.status}`,
        message: errorText
      });
    }

    const data = await response.json();
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors: data.errors
      });
    }

    console.log(`✅ Live: ${data.response?.length || 0} matches`);

    return res.status(200).json({
      success: true,
      results: data.results,
      fixtures: data.response
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
