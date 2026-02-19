# 🚀 Quick Start - Mercado Pago

## ⚡ Configuração Rápida (5 minutos)

### 1. Instalar Dependência
```bash
cd backend
npm install
```

### 2. Configurar Variáveis de Ambiente

**Backend** (criar `.env` em `/backend/`):
```bash
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-xxxxxx-xxxxxxxxxx
SITE_URL=http://localhost:5173
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
PORT=3000
```

### 3. Obter Token de Teste

1. Acesse: https://www.mercadopago.com.br/developers/panel/credentials
2. Clique em "Credenciais de teste"
3. Copie o **Access Token**
4. Cole no `.env` como `MERCADOPAGO_ACCESS_TOKEN`

### 4. Iniciar Backend
```bash
cd backend
npm start
```

### 5. Iniciar Frontend
```bash
# Em outro terminal
npm run dev
```

---

## 🧪 Testar Pagamento

### Opção 1: Simular (sem Mercado Pago)
```bash
# Faça login no site primeiro
# Depois execute:
curl -X POST http://localhost:3000/api/payments/simulate-approval \
  -H "Content-Type: application/json" \
  -d '{"userId": "SEU_USER_ID"}'
```

### Opção 2: Fluxo Completo (com Mercado Pago Sandbox)

1. Clique em "Assinar Premium" no site
2. Clique em "Pagar com Mercado Pago"
3. Use cartão de teste:
   - **Número:** `5031 4332 1540 6351`
   - **CVV:** `123`
   - **Validade:** Qualquer data futura
   - **Nome:** Qualquer nome

4. Confirme o pagamento
5. Você será redirecionado de volta ao site
6. Premium ativado! ✅

---

## 📋 Checklist

- [ ] Instalado `mercadopago` no backend
- [ ] Configurado `MERCADOPAGO_ACCESS_TOKEN` (token de teste)
- [ ] Configurado `SITE_URL`
- [ ] Backend rodando na porta 3000
- [ ] Frontend rodando
- [ ] Testado fluxo de pagamento

---

## 🐛 Problemas Comuns

### "Mercado Pago não configurado"
→ Verifique se `MERCADOPAGO_ACCESS_TOKEN` está no `.env`

### Webhook não funciona localmente
→ Use ngrok ou teste apenas a simulação:
```bash
POST /api/payments/simulate-approval
```

### Página não redireciona
→ Verifique console do navegador para erros
→ Verifique se `SITE_URL` está correto

---

## 📚 Mais Informações

- **Guia Detalhado:** [MERCADOPAGO_SETUP.md](./MERCADOPAGO_SETUP.md)
- **Resumo Técnico:** [MERCADOPAGO_IMPLEMENTATION.md](./MERCADOPAGO_IMPLEMENTATION.md)
- **Docs Oficiais:** https://www.mercadopago.com.br/developers/pt/docs
