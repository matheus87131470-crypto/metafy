# 🛒 Configuração do Mercado Pago

## 📋 Resumo da Implementação

O sistema agora usa **Mercado Pago Checkout Pro** para processar pagamentos premium (R$ 3,50 por 7 dias).

### 🎯 Fluxo de Pagamento

1. **Usuário clica em "Pagar com Mercado Pago"**
2. **Backend cria preferência de pagamento** (endpoint `/api/payments/checkout`)
3. **Usuário é redirecionado** para página do Mercado Pago
4. **Usuário paga via PIX ou Cartão** na página do Mercado Pago
5. **Mercado Pago envia webhook** quando pagamento é aprovado
6. **Backend ativa premium** automaticamente por 7 dias
7. **Usuário retorna ao site** com premium ativo

---

## 🔧 Configuração

### 1️⃣ Criar Conta no Mercado Pago

1. Acesse [https://www.mercadopago.com.br](https://www.mercadopago.com.br)
2. Crie uma conta ou faça login
3. Vá em **"Seu negócio" → "Configurações" → "Credenciais"**

### 2️⃣ Obter Access Token

No painel de credenciais:

- **Modo Teste** (para desenvolvimento):
  - Copie o `Access Token de Teste`
  
- **Modo Produção** (para o site real):
  - Copie o `Access Token de Produção`

### 3️⃣ Configurar Variáveis de Ambiente

**No Backend (Render/Vercel):**

```bash
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxxxxxx
SITE_URL=https://metafy.store
```

**Nota:** O `SITE_URL` é usado para:
- Webhook de notificações: `{SITE_URL}/api/webhooks/mercadopago`
- URLs de retorno após pagamento

### 4️⃣ Configurar Webhook no Mercado Pago

1. No painel do Mercado Pago, vá em **"Seu negócio" → "Configurações" → "Notificações"**
2. Configure a URL do webhook:
   ```
   https://metafy.store/api/webhooks/mercadopago
   ```
3. Selecione eventos: **Pagamentos**

---

## 🧪 Testar em Modo Sandbox

### Usar Access Token de Teste

Configure no backend:
```bash
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxxxxxx
```

### Cartões de Teste

O Mercado Pago fornece cartões de teste. Exemplos:

**Aprovado:**
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: Qualquer data futura

**Rejeitado:**
- Número: `5031 7557 3453 0604`

**Pendente:**
- Número: `5031 4332 1540 6351`
- CVV: `123`

Mais detalhes: [Cartões de Teste MP](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing)

---

## 📡 Endpoints Criados

### `POST /api/payments/checkout`
Cria preferência de pagamento e retorna URL de checkout.

**Request:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=xxx",
  "preference_id": "123-xxx",
  "external_reference": "premium7|user_123|1234567890"
}
```

### `POST /api/webhooks/mercadopago`
Recebe notificações do Mercado Pago quando pagamento é aprovado.

**Webhook Body (exemplo):**
```json
{
  "type": "payment",
  "action": "payment.updated",
  "data": {
    "id": "1234567890"
  }
}
```

**Ação do webhook:**
1. Busca detalhes do pagamento via API do MP
2. Verifica se status é `approved`
3. Extrai `userId` do `external_reference`
4. Ativa premium por 7 dias no `userStore`

### `POST /api/payments/simulate-approval`
**[APENAS TESTE]** Simula aprovação de pagamento sem Mercado Pago.

**Request:**
```json
{
  "userId": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "✅ Premium ativado para user_123 por 7 dias (simulação)"
}
```

---

## 🔒 Segurança Implementada

### ✅ Verificação no Backend
- Premium é **sempre verificado no servidor** (não confia em localStorage)
- Middleware `checkPaywall` bloqueia análises de usuários sem acesso
- Token JWT valida identidade do usuário

### ✅ External Reference
- Formato: `premium7|{userId}|{timestamp}`
- Permite rastrear pagamentos e evitar duplicações

### ✅ Webhook Seguro
- Responde sempre `200 OK` para evitar reenvios
- Busca dados do pagamento diretamente da API do MP
- Não confia apenas no body do webhook

---

## 📦 Dependências Adicionadas

**Backend:**
```json
{
  "mercadopago": "^2.0.0"
}
```

Instalar com:
```bash
cd backend
npm install mercadopago
```

---

## ✅ Checklist de Deploy

- [ ] Obter Access Token do Mercado Pago (produção)
- [ ] Configurar `MERCADOPAGO_ACCESS_TOKEN` no Render
- [ ] Configurar `SITE_URL=https://metafy.store` no Render
- [ ] Configurar webhook no painel do Mercado Pago
- [ ] Testar fluxo completo em produção
- [ ] Verificar logs do webhook no Render

---

## 🐛 Debug

### Ver logs do webhook:
```bash
# No Render
Settings → Logs → buscar por "Webhook Mercado Pago"
```

### Testar webhook localmente:
Use o [ngrok](https://ngrok.com/) para expor o backend local:
```bash
ngrok http 3000
# Use a URL do ngrok como SITE_URL
```

### Simular pagamento aprovado:
```bash
curl -X POST https://metafy.store/api/payments/simulate-approval \
  -H "Content-Type: application/json" \
  -d '{"userId": "seu_user_id"}'
```

---

## 📚 Documentação Oficial

- [Mercado Pago - Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing)
- [Mercado Pago - Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Mercado Pago - SDK Node.js](https://www.mercadopago.com.br/developers/pt/docs/sdks-library/server-side/node)
