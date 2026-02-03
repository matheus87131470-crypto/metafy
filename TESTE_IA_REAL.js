#!/usr/bin/env node

/**
 * TESTE RÁPIDO - Integração IA Real
 * 
 * Cole o código abaixo no console do navegador (F12)
 * enquanto estiver em https://metafy-virid.vercel.app
 */

// ===================================
// TESTE 1: Verificar AIAnalyzer carregado
// ===================================
console.log('✅ AIAnalyzer carregado?', typeof AIAnalyzer !== 'undefined');

// ===================================
// TESTE 2: Criar instância e testar
// ===================================
const testAnalyzer = new AIAnalyzer();
console.log('✅ Instância criada:', testAnalyzer);

// ===================================
// TESTE 3: Fazer análise real
// ===================================
(async () => {
    console.log('⏳ Iniciando análise IA Real...');
    
    try {
        const game = {
            homeTeam: 'Flamengo',
            awayTeam: 'Palmeiras',
            competition: 'Campeonato Brasileiro'
        };
        
        const result = await testAnalyzer.analyzeGame(
            game,
            'vencedor',
            2.50,
            100,
            'Em casa, forma boa'
        );
        
        console.log('✅ SUCESSO! Análise recebida:');
        console.log('  Source:', result.source);
        console.log('  Game:', result.gameInfo);
        console.log('  Análise:', result.rawAnalysis.substring(0, 200) + '...');
        console.log('  Ganho Potencial:', result.potentialGain);
        console.log('  ROI:', result.roi + '%');
        console.log('\n✨ IA REAL FUNCIONANDO! ✨');
        
    } catch (error) {
        console.error('❌ ERRO:', error.message);
        console.log('Possíveis causas:');
        console.log('1. Backend não está rodando');
        console.log('2. OPENAI_API_KEY inválida');
        console.log('3. Sem conexão com internet');
        console.log('4. Timeout (>30s)');
    }
})();

// ===================================
// TESTE 4: Verificar Balance
// ===================================
console.log('\n✅ BalanceManager carregado?', typeof BalanceManager !== 'undefined');
if (typeof BalanceManager !== 'undefined') {
    const balance = new BalanceManager();
    console.log('  Ganhos:', balance.gains);
    console.log('  Perdas:', balance.losses);
    console.log('  Saldo:', balance.getBalance());
}

// ===================================
// TESTE 5: Verificar localStorage
// ===================================
console.log('\n📊 LocalStorage Data:');
console.log('  Transações:', JSON.parse(localStorage.getItem('football_transactions') || '[]').length, 'registros');
console.log('  Metas:', JSON.parse(localStorage.getItem('userGoals') || '[]').length, 'metas');

console.log('\n✅ Todos os testes completados!');
