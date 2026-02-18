# 🧪 GUIA RÁPIDO DE TESTES - PAYWALL

## ⚡ TESTE RÁPIDO (5 minutos)

### 1. Abrir Site
```
https://metafy-gamma.vercel.app
```

**Console deve mostrar:**
```
🚀 Metafy iniciando...
🆔 Novo userId criado: user_1739879431234_abc123
👤 Status do usuário: {isPremium: false, freeRemaining: 2, daysRemaining: 0}
```

### 2. Primeira Análise
- Clicar em qualquer jogo
- Clicar "🤖 Analisar com IA"
- ✅ Deve funcionar normalmente

**Console:**
```
🤖 Buscando insights de IA para match 1...
✅ Análise consumida (restam 1)
```

### 3. Segunda Análise
- Escolher outro jogo
- Clicar "🤖 Analisar com IA"
- ✅ Deve funcionar normalmente

**Console:**
```
✅ Análise consumida (restam 0)
```

### 4. Terceira Análise (PAYWALL)
- Escolher outro jogo
- Clicar "🤖 Analisar com IA"
- 🔒 **Modal de paywall deve abrir:**

```
┌─────────────────────────────────────┐
│              🔒                      │
│        Limite Atingido               │
│                                      │
│  Limite de análises gratuitas       │
│  atingido                            │
│                                      │
│  ┌────────────────────────────┐     │
│  │   PAGAMENTO ÚNICO          │     │
│  │        R$ 3,50             │     │
│  │   7 dias • Sem renovação   │     │
│  └────────────────────────────┘     │
│                                      │
│  💎 Pagar R$ 3,50 e Liberar Acesso  │
│                                      │
└─────────────────────────────────────┘
```

**Console:**
```
🔒 Paywall ativado: Limite gratuito acabou
```

---

## 🔧 TESTE COM SIMULAÇÃO DE PREMIUM

### 1. Obter seu userId
```javascript
// No console do navegador:
localStorage.getItem('metafy_user_id')
// Retorna: "user_1739879431234_abc123"
```

### 2. Ativar Premium (API)
**Via Postman/Insomnia/curl:**
```bash
curl -X POST https://metafy-8qk7.onrender.com/api/payments/simulate-approval \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_1739879431234_abc123"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Premium ativado para user_xxx por 7 dias (simulação)"
}
```

### 3. Verificar Status
```bash
curl "https://metafy-8qk7.onrender.com/api/me?userId=user_1739879431234_abc123"
```

**Resposta esperada:**
```json
{
  "success": true,
  "userId": "user_1739879431234_abc123",
  "isPremium": true,
  "premiumUntil": "2026-02-25T...",
  "daysRemaining": 7,
  "freeRemaining": 0,
  "canAnalyze": true
}
```

### 4. Testar Análises Ilimitadas
- Recarregar página
- Fazer análises → ✅ Todas funcionam (sem bloquear)
- **Console:**
```
👤 Status do usuário: {isPremium: true, freeRemaining: 0, daysRemaining: 7}
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Failed to fetch"
**Causa:** Backend não respondendo ou CORS  
**Solução:**
```bash
# Verificar se backend está up
curl https://metafy-8qk7.onrender.com/health

# Se retornar {"status":"ok",...} → backend OK
# Se timeout → aguardar deploy (~2-3 min)
```

### Erro: userId null
**Causa:** localStorage bloqueado  
**Solução:** Permitir cookies no navegador

### Paywall não bloqueia
**Causa:** Cache de status desatualizado  
**Solução:**
```javascript
// No console:
localStorage.clear()
location.reload()
```

### Premium não ativa
**Verificar data/users.json no backend:**
```bash
# Via SSH/logs do Render
cat data/users.json

# Deve conter:
{
  "user_xxx": {
    "id": "user_xxx",
    "freeRemaining": 0,
    "premiumUntil": "2026-02-25T..."
  }
}
```

---

## 📊 ENDPOINTS ÚTEIS

### Health Check
```bash
GET https://metafy-8qk7.onrender.com/health
→ {"status":"ok","timestamp":"2026-02-18T..."}
```

### Status do Usuário
```bash
GET https://metafy-8qk7.onrender.com/api/me?userId=USER_ID
→ {isPremium, freeRemaining, daysRemaining}
```

### Criar Pagamento (Mock)
```bash
POST https://metafy-8qk7.onrender.com/api/payments/create
Body: {"userId":"USER_ID"}
→ {paymentId, checkoutUrl, amount}
```

### Simular Aprovação
```bash
POST https://metafy-8qk7.onrender.com/api/payments/simulate-approval
Body: {"userId":"USER_ID"}
→ {success:true, message:"Premium ativado..."}
```

### Análise (com paywall)
```bash
POST https://metafy-8qk7.onrender.com/api/analyze
Body: {"userId":"USER_ID","matchId":1,"gameData":{...}}

# Se bloqueado:
→ 402 Payment Required
  {needPayment:true, message:"Limite gratuito acabou"}

# Se permitido:
→ 200 OK
  {success:true, analysis:{...}, userStatus:{...}}
```

---

## ✅ CHECKLIST FINAL

- [ ] Backend deployed no Render
- [ ] Frontend deployed no Vercel
- [ ] Console mostra userId criado
- [ ] Console mostra status {freeRemaining: 2}
- [ ] 1ª análise funciona
- [ ] 2ª análise funciona
- [ ] 3ª análise BLOQUEIA com modal
- [ ] Modal mostra "R$ 3,50"
- [ ] Simulação de premium funciona
- [ ] Após premium, análises ilimitadas
- [ ] Após 7 dias, premium expira (testar com data passada)

---

## 🎯 CRITÉRIOS DE SUCESSO

✅ **Paywall funciona:**
- Bloqueia na 3ª análise
- Modal aparece com botão de pagamento
- Contador mostra "0/2 restantes"

✅ **Premium funciona:**
- Simular aprovação ativa premium
- Status retorna {isPremium: true, daysRemaining: 7}
- Análises funcionam ilimitadamente

✅ **Expiração funciona:**
- Alterar premiumUntil para data passada
- Status retorna {isPremium: false}
- Análises bloqueiam novamente

---

**Tempo estimado de teste completo:** 5-10 minutos  
**Última atualização:** 18/02/2026
