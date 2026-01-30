/**
 * GUIA DE USO - EXEMPLOS E TESTES
 * Copie e cole no console do navegador (F12 > Console)
 */

// ========================================
// 1. TESTER DE ANÁLISE DE APOSTAS
// ========================================

console.log("=== BETTING ANALYZER TESTER ===");

// Criar instância (já existe globalmente como window.BettingAnalyzer)
const analyzer = new BettingAnalyzer();

// Teste 1: Análise simples
console.log("📊 TESTE 1: Análise Básica");
const analise1 = analyzer.analyze({
    team: "Barcelona vs Real Madrid",
    type: "vitoria",
    odd: 1.85,
    amount: 100,
    notes: "Barcelona em casa, melhor desempenho"
});
console.log(analise1);

// Teste 2: Aposta de risco alto
console.log("\n🚨 TESTE 2: Alto Risco");
const analise2 = analyzer.analyze({
    team: "Underdog FC",
    type: "vitoria",
    odd: 5.50,
    amount: 50,
    notes: "Pode surpreender"
});
console.log(analise2);

// Teste 3: Aposta conservadora
console.log("\n✅ TESTE 3: Baixo Risco");
const analise3 = analyzer.analyze({
    team: "Time Favorito",
    type: "vitoria",
    odd: 1.20,
    amount: 500,
    notes: "Grande favorito"
});
console.log(analise3);

// Teste 4: Validação com erros
console.log("\n❌ TESTE 4: Validação");
const errors = analyzer.validateBetData({
    team: "",
    type: "vitoria",
    odd: -1,
    amount: 0
});
console.log("Erros encontrados:", errors);

// ========================================
// 2. TESTER DE CONTROLE DE SALDO
// ========================================

console.log("\n=== BALANCE MANAGER TESTER ===");

// Criar instância
const balance = new BalanceManager('testBalance');

// Teste 1: Adicionar transações
console.log("💰 TESTE 1: Adicionar Ganhos e Perdas");
balance.addGain(500, "Aposta 1 - Vitória");
balance.addLoss(100, "Aposta 2 - Derrota");
balance.addGain(250, "Aposta 3 - Parcial");
balance.addLoss(50, "Aposta 4 - Derrota");
balance.addGain(1000, "Aposta 5 - Grande Vitória");

// Teste 2: Obter estatísticas
console.log("\n📈 TESTE 2: Estatísticas");
const stats = balance.getStatistics();
console.log("Ganhos Totais:", stats.totalGains);
console.log("Perdas Totais:", stats.totalLoss);
console.log("Saldo:", stats.balance);
console.log("ROI:", stats.roi + "%");
console.log("Contagem:", stats.gainCount + " ganhos, " + stats.lossCount + " perdas");

// Teste 3: Proporções da barra
console.log("\n📊 TESTE 3: Proporções para Barra Visual");
const proportions = balance.getBarProportions();
console.log("Ganhos:", proportions.gainPercent + "%");
console.log("Perdas:", proportions.lossPercent + "%");

// Teste 4: Histórico
console.log("\n📋 TESTE 4: Histórico de Transações");
const transactions = balance.getAllTransactions(3);
transactions.forEach(t => {
    const type = t.type === 'gain' ? '✓' : '✗';
    const time = BalanceManager.formatDateTime(t.timestamp);
    console.log(`${type} ${t.type.toUpperCase()} - R$ ${t.amount.toFixed(2)} (${time})`);
});

// Teste 5: Exportar dados
console.log("\n💾 TESTE 5: Exportar Dados JSON");
const json = balance.export();
console.log("JSON (copie para backup):");
console.log(json);

// Teste 6: Formatar valores
console.log("\n🔢 TESTE 6: Formatação de Valores");
console.log("Moeda:", BalanceManager.formatCurrency(1234.56));
console.log("Data:", BalanceManager.formatDate(new Date().toISOString()));

// ========================================
// 3. TESTER DE NAVEGAÇÃO DE ABAS
// ========================================

console.log("\n=== TAB NAVIGATION TESTER ===");

function testTabNavigation() {
    console.log("📑 Testando navegação de abas...");
    
    const tabButtons = document.querySelectorAll('.tab-button');
    console.log("Abas encontradas:", tabButtons.length);
    
    tabButtons.forEach((btn, index) => {
        const tabName = btn.getAttribute('data-tab');
        console.log(`${index + 1}. Aba: ${tabName}`);
    });

    // Simular clique na aba "analise"
    console.log("\n🖱️ Clicando na aba IA Análise...");
    const analyzeTab = document.querySelector('[data-tab="analise"]');
    if (analyzeTab) {
        analyzeTab.click();
        console.log("✓ Aba IA Análise ativada");
    }

    // Simular clique na aba "ganhos"
    console.log("\n🖱️ Clicando na aba Ganhos/Perdas...");
    const balanceTab = document.querySelector('[data-tab="ganhos"]');
    if (balanceTab) {
        balanceTab.click();
        console.log("✓ Aba Ganhos/Perdas ativada");
    }

    // Voltar para metas
    console.log("\n🖱️ Clicando na aba Metas...");
    const metasTab = document.querySelector('[data-tab="metas"]');
    if (metasTab) {
        metasTab.click();
        console.log("✓ Aba Metas ativada");
    }
}

// Chamar teste
testTabNavigation();

// ========================================
// 4. TESTER DE FORMULÁRIOS
// ========================================

console.log("\n=== FORM TESTING ===");

function testBettingForm() {
    console.log("📝 Preenchendo formulário de apostas...");
    
    document.getElementById('betTeam').value = "Flamengo vs Fluminense";
    document.getElementById('betType').value = "vitoria";
    document.getElementById('betOdd').value = "2.30";
    document.getElementById('betAmount').value = "100";
    document.getElementById('betNotes').value = "Derbi carioca - Flamengo favorito";
    
    console.log("✓ Formulário preenchido com dados de teste");
    console.log("Clique em 'Analisar' ou execute: document.getElementById('btnAnalyze').click()");
}

testBettingForm();

// ========================================
// 5. INTEGRAÇÃO COMPLETA
// ========================================

console.log("\n=== FLUXO COMPLETO ===");

function fullIntegrationTest() {
    console.log("🎯 Executando fluxo completo...\n");

    // 1. Analisar aposta
    console.log("1️⃣ Analisando aposta...");
    const analyzer = new BettingAnalyzer();
    const analysis = analyzer.analyze({
        team: "Teste FC",
        type: "vitoria",
        odd: 2.50,
        amount: 200,
        notes: "Teste automatizado"
    });
    console.log("✓ Análise concluída");
    console.log(`   Lucro potencial: R$ ${analysis.netProfit}`);
    console.log(`   Risco: ${analysis.riskLevel.label}`);

    // 2. Registrar resultado
    console.log("\n2️⃣ Registrando resultado...");
    const balance = new BalanceManager();
    balance.addGain(parseFloat(analysis.netProfit), "De: " + analysis.team);
    console.log("✓ Ganho registrado");

    // 3. Exibir estatísticas
    console.log("\n3️⃣ Estatísticas atualizadas...");
    const stats = balance.getStatistics();
    console.log(`   Total: R$ ${stats.balance}`);
    console.log(`   ROI: ${stats.roi}%`);

    console.log("\n✅ Fluxo completo finalizado!");
}

// Chamar teste (comentado para não poluir console automaticamente)
// fullIntegrationTest();

// ========================================
// DICAS E ATALHOS
// ========================================

console.log("\n╔════════════════════════════════════════════╗");
console.log("║       🎯 DICAS DE TESTES RÁPIDOS        ║");
console.log("╠════════════════════════════════════════════╣");
console.log("║                                            ║");
console.log("║ Limpar balanceManager:                     ║");
console.log("║   > localStorage.removeItem('userBalance') ║");
console.log("║   > location.reload()                      ║");
console.log("║                                            ║");
console.log("║ Visualizar localStorage:                   ║");
console.log("║   > JSON.parse(localStorage.userBalance)   ║");
console.log("║                                            ║");
console.log("║ Exportar dados:                            ║");
console.log("║   > console.log(balanceManager.export())   ║");
console.log("║                                            ║");
console.log("║ Registrar transação rápido:                ║");
console.log("║   > balanceManager.addGain(100)            ║");
console.log("║   > balanceManager.addLoss(50)             ║");
console.log("║                                            ║");
console.log("╚════════════════════════════════════════════╝\n");

// ========================================
// EXPORTAR FUNÇÕES GLOBAIS (CONSOLE AUTOMÁTICO)
// ========================================

window.testAnalyzer = () => {
    const a = new BettingAnalyzer();
    return a.analyze({
        team: "Teste",
        type: "vitoria",
        odd: 2.0,
        amount: 100
    });
};

window.testBalance = () => {
    const b = new BalanceManager();
    b.addGain(500);
    b.addLoss(100);
    return b.getStatistics();
};

console.log("📌 Funções rápidas disponíveis:");
console.log("   > testAnalyzer()  - Testar análise");
console.log("   > testBalance()   - Testar saldo\n");
