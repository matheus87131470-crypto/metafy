/**
 * Demo Data - Dados de exemplo para teste
 * Execute no console: loadDemoData() para preencher com exemplos
 */

function loadDemoData() {
    const demoGoals = [
        {
            id: '1704067200000',
            title: 'Investimentos',
            type: 'money',
            target: 10000,
            current: 8542,
            startDate: '2026-01-01',
            endDate: '2026-03-31',
            unit: 'R$',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-30T10:30:00.000Z',
            history: [
                { date: '2026-01-01T00:00:00.000Z', value: 2000 },
                { date: '2026-01-10T00:00:00.000Z', value: 4500 },
                { date: '2026-01-20T00:00:00.000Z', value: 6800 },
                { date: '2026-01-30T10:30:00.000Z', value: 8542 }
            ]
        },
        {
            id: '1704153600000',
            title: 'Projeto Alpha',
            type: 'tasks',
            target: 48,
            current: 32,
            startDate: '2026-01-15',
            endDate: '2026-02-28',
            unit: 'tarefas',
            createdAt: '2026-01-15T00:00:00.000Z',
            updatedAt: '2026-01-28T15:45:00.000Z',
            history: [
                { date: '2026-01-15T00:00:00.000Z', value: 0 },
                { date: '2026-01-18T00:00:00.000Z', value: 8 },
                { date: '2026-01-22T00:00:00.000Z', value: 16 },
                { date: '2026-01-25T00:00:00.000Z', value: 24 },
                { date: '2026-01-28T15:45:00.000Z', value: 32 }
            ]
        },
        {
            id: '1704240000000',
            title: 'Performance',
            type: 'percentage',
            target: 100,
            current: 92,
            startDate: '2026-01-01',
            endDate: '2026-01-31',
            unit: '%',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-30T09:00:00.000Z',
            history: [
                { date: '2026-01-01T00:00:00.000Z', value: 75 },
                { date: '2026-01-10T00:00:00.000Z', value: 82 },
                { date: '2026-01-20T00:00:00.000Z', value: 88 },
                { date: '2026-01-30T09:00:00.000Z', value: 92 }
            ]
        },
        {
            id: '1704326400000',
            title: 'Leitura de Livros',
            type: 'custom',
            target: 12,
            current: 7,
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            unit: 'livros',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-25T18:20:00.000Z',
            history: [
                { date: '2026-01-01T00:00:00.000Z', value: 0 },
                { date: '2026-01-15T00:00:00.000Z', value: 2 },
                { date: '2026-01-20T00:00:00.000Z', value: 4 },
                { date: '2026-01-25T18:20:00.000Z', value: 7 }
            ]
        },
        {
            id: '1704412800000',
            title: 'Exercício Físico',
            type: 'tasks',
            target: 60,
            current: 45,
            startDate: '2026-01-01',
            endDate: '2026-03-31',
            unit: 'sessões',
            createdAt: '2026-01-05T00:00:00.000Z',
            updatedAt: '2026-01-29T17:15:00.000Z',
            history: [
                { date: '2026-01-05T00:00:00.000Z', value: 0 },
                { date: '2026-01-12T00:00:00.000Z', value: 10 },
                { date: '2026-01-19T00:00:00.000Z', value: 25 },
                { date: '2026-01-26T00:00:00.000Z', value: 38 },
                { date: '2026-01-29T17:15:00.000Z', value: 45 }
            ]
        }
    ];

    try {
        localStorage.setItem('userGoals', JSON.stringify(demoGoals));
        location.reload();
        console.log('✅ Dados de demo carregados! Recarregando...');
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
    }
}

function clearAllData() {
    if (confirm('⚠️ Tem certeza? Isto vai deletar TODAS as metas.')) {
        localStorage.removeItem('userGoals');
        location.reload();
        console.log('✅ Todos os dados foram deletados.');
    }
}

// Exibir no console
console.log('%c🎯 Dashboard de Metas - Comandos Disponíveis', 'font-size: 14px; font-weight: bold; color: #6366f1;');
console.log('%cloadDemoData() - Carregar 5 metas de exemplo', 'color: #14b8a6; font-size: 12px;');
console.log('%cclearAllData() - Deletar todas as metas', 'color: #ec4899; font-size: 12px;');
console.log('%cupdateGoalProgress(goalId, value) - Atualizar progresso', 'color: #6366f1; font-size: 12px;');
console.log('%cgetAllGoals() - Ver todas as metas', 'color: #6366f1; font-size: 12px;');
