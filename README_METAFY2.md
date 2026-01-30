```markdown
# 🎯 Metafy 2.0 - Plataforma de Análise de Apostas & Controle Financeiro

## 📌 O Que é Metafy 2.0?

Evolução do dashboard original para uma **plataforma completa de análise esportiva** com foco em:

1. **🎯 Gerenciamento de Metas** - Sistema original mantido
2. **🤖 IA para Análise de Apostas** - Simulação de inteligência para análise de riscos
3. **📊 Controle de Ganhos/Perdas** - Rastreamento financeiro visual

---

## 🚀 Início Rápido

### Abrir no Navegador

```bash
# Opção 1: Abrir arquivo diretamente
file:///c:/Users/Markim/OneDrive/Área%20de%20Trabalho/Organizacao/index.html

# Opção 2: Com servidor local
npx http-server -p 8000
# Acessar: http://localhost:8000
```

### Primeiros Passos

1. **Abra o site** em seu navegador
2. **Navegue pelos tabs** (Metas / IA Análise / Ganhos/Perdas)
3. **Teste cada funcionalidade** usando exemplos abaixo

---

## 📑 Abas Disponíveis

### Tab 1: 🎯 Metas
Sistema original de rastreamento de objetivos com gauges animados

```
✓ Criar nova meta
✓ Editar metas existentes
✓ Visualizar progresso em tempo real
✓ Deletar metas
✓ Gauge semicircular com animação suave
```

### Tab 2: 🤖 IA Análise
Análise de apostas esportivas com recomendações de estratégia

**Exemplo de Uso:**
```
1. Time/Evento: "Barcelona vs Real Madrid"
2. Tipo de Aposta: "Vitória"
3. Odd: "2.50"
4. Valor: "R$ 100"
5. Notas: "Barcelona em casa, favoritos"
6. Clique em "Analisar" 🔍
```

**Resultado:**
- Lucro potencial calculado
- Nível de risco identificado
- Estratégia recomendada
- Observações importantes
- Disclaimer legal

### Tab 3: 📊 Ganhos/Perdas
Rastreamento financeiro com visualização

**Como Usar:**
```
1. Digite o valor em "Adicionar Ganho" ou "Adicionar Perda"
2. Clique no botão verde (ganho) ou vermelho (perda)
3. Veja o histórico atualizar automaticamente
4. Observe a barra visual de proporção
5. Verifique as estatísticas no topo
```

---

## 💻 Testes via Console (F12)

### Teste 1: Analisar Aposta

```javascript
const analyzer = new BettingAnalyzer();
const resultado = analyzer.analyze({
    team: "Seu Time",
    type: "vitoria",
    odd: 2.50,
    amount: 100,
    notes: "Observação"
});
console.log(resultado);
```

### Teste 2: Registrar Ganho/Perda

```javascript
const balance = new BalanceManager();
balance.addGain(500, "Aposta ganha");
balance.addLoss(100, "Aposta perdida");
const stats = balance.getStatistics();
console.log(stats);
```

### Teste 3: Listar Histórico

```javascript
const balance = new BalanceManager();
const transactions = balance.getAllTransactions();
console.table(transactions);
```

### Teste 4: Exportar Dados

```javascript
const balance = new BalanceManager();
console.log(balance.export());
// Copie e salve em arquivo .json para backup
```

---

## 📂 Estrutura de Arquivos

```
Organizacao/
├── index.html              ← Arquivo principal
├── styles.css              ← Estilos + responsividade
├── gauge.js                ← Componente de gauges
├── goals.js                ← Gerenciador de metas
├── notifications.js        ← Sistema de notificações
├── betting-analysis.js     ← NEW: Análise de apostas
├── balance-manager.js      ← NEW: Controle de saldo
├── main.js                 ← Lógica principal
├── demo-data.js            ← Dados de teste
├── package.json
├── vercel.json
├── FEATURES.md             ← Documentação de features
├── TESTING.js              ← Scripts de teste
└── README.md               ← Este arquivo
```

---

## 🔒 Dados Armazenados

Todos os dados são salvos no **localStorage** do navegador:

### Metas
```javascript
localStorage.userGoals  // JSON array de metas
```

### Ganhos/Perdas
```javascript
localStorage.userBalance  // JSON com transações
```

**Verificar dados:**
```javascript
console.log(JSON.parse(localStorage.userGoals));
console.log(JSON.parse(localStorage.userBalance));
```

**Limpar dados:**
```javascript
localStorage.removeItem('userGoals');
localStorage.removeItem('userBalance');
location.reload();
```

---

## 🎨 Design & Responsividade

✅ **Glassmorphism** - Efeitos visuais modernos  
✅ **Dark Theme** - Tema escuro profissional  
✅ **Mobile First** - 100% responsivo (480px+)  
✅ **Animações Suaves** - Transições fluidas  
✅ **Modo Claro/Escuro Ready** - Preparado para toggle  

**Pontos de Quebra:**
- 480px: Mobile (phones)
- 768px: Tablet
- 1024px+: Desktop

---

## 🔧 Tecnologias Utilizadas

- **HTML5** - Semântica moderna
- **CSS3** - Glassmorphism, Grid, Flexbox
- **JavaScript ES6+** - Vanilla (sem dependências)
- **Canvas API** - Para gauges animados
- **localStorage** - Persistência de dados
- **Vercel** - Deploy automático

**Zero Dependências Externas!** 🎉

---

## 🚀 Deploy (Vercel)

Arquivo já configurado para Vercel. Apenas faça:

```bash
git add .
git commit -m "Update: Add betting analysis & balance tracking"
git push
```

Vercel deploy automaticamente em segundos.

---

## 📊 Exemplos de Dados

### Exemplo 1: Análise Baixo Risco
```javascript
{
    team: "Barcelona",
    type: "vitoria",
    odd: 1.50,
    amount: 500,
    notes: "Grande favorito"
}
// Resultado: Risco BAIXO, ROI ~50%, Estratégia conservadora
```

### Exemplo 2: Análise Alto Risco
```javascript
{
    team: "Underdog FC",
    type: "vitoria",
    odd: 8.00,
    amount: 50,
    notes: "Pode surpreender"
}
// Resultado: Risco ALTO, ROI ~400%, Estratégia agressiva
```

### Exemplo 3: Análise Médio Risco
```javascript
{
    team: "Time B vs Time A",
    type: "empate",
    odd: 3.50,
    amount: 100,
    notes: "Histórico de empates"
}
// Resultado: Risco MÉDIO, ROI ~250%, Estratégia balanceada
```

---

## 🔮 Próximas Funcionalidades Planejadas

### Curto Prazo
- [ ] Integração com API real de odds
- [ ] Dashboard de estatísticas pessoais
- [ ] Mais tipos de apostas
- [ ] Notificações push

### Médio Prazo
- [ ] Backend Node.js/Python
- [ ] Banco de dados (MongoDB/PostgreSQL)
- [ ] Sistema de autenticação
- [ ] Machine Learning para recomendações

### Longo Prazo
- [ ] App mobile nativo
- [ ] Comunidade de apostadores
- [ ] Integração com corretoras
- [ ] Sistema de ranking

---

## 🐛 Troubleshooting

### Dados não aparecem após reload
**Solução:** Verifique localStorage
```javascript
// No console:
console.log(localStorage);
// Procure por 'userGoals' e 'userBalance'
```

### Campos de formulário vazios
**Solução:** Limpe cache do navegador
```
Ctrl + Shift + Delete (ou Cmd + Shift + Delete no Mac)
→ Selecione "Cookies e arquivos em cache"
→ Clique em Limpar
```

### Abas não funcionam
**Solução:** Verifique console para erros
```
F12 → Console → Veja mensagens de erro
```

---

## 📞 Suporte

### Teste Rápido
Copie no console (F12):
```javascript
// Verificar se tudo está carregado
console.log("Goals Manager:", typeof GoalsManager);
console.log("Betting Analyzer:", typeof BettingAnalyzer);
console.log("Balance Manager:", typeof BalanceManager);
```

Deve mostrar `function` para todos.

### Debug Mode
```javascript
// Ativar logs detalhados
localStorage.setItem('debug', 'true');
location.reload();
```

---

## 📄 Licença & Créditos

Desenvolvido para Metafy 2.0  
Estilo Glassmorphism - Inspirado em designs modernos  
Data: 2024

---

## ✅ Checklist de Funcionalidades

- ✅ Dashboard com 3 abas navegáveis
- ✅ Análise de apostas com mock IA
- ✅ Cálculo de risco e ROI
- ✅ Recomendações de estratégia
- ✅ Controle de ganhos/perdas
- ✅ Visualização com barra proporcional
- ✅ Histórico de transações
- ✅ localStorage para persistência
- ✅ Responsivo em mobile + desktop
- ✅ Design glassmorphism mantido
- ✅ Pronto para deploy
- ✅ Zero dependências externas

---

## 🎓 Tutorial Completo

### Cenário 1: Análise Diária de Apostas

```
1. Navegue para "IA Análise"
2. Preencha dados da aposta
3. Clique "Analisar"
4. Leia recomendações
5. Após resultado, vá para "Ganhos/Perdas"
6. Registre o resultado
7. Veja histórico e estatísticas atualizadas
```

### Cenário 2: Acompanhar Metas + Apostas

```
1. Crie metas de ganho (ex: "Ganhar R$ 1.000 em Agosto")
2. Analise apostas na aba "IA Análise"
3. Registre resultados em "Ganhos/Perdas"
4. Compare com progresso da meta
```

### Cenário 3: Exportar Histórico

```
1. Vá para console (F12)
2. Execute: balanceManager.export()
3. Copie o resultado JSON
4. Salve em arquivo .json
5. Use para análises futuras
```

---

**Aproveite Metafy 2.0! 🚀**
```
