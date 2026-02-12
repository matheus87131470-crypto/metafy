# 💳 Sistema de Pagamento PIX - Mercado Pago

## 📋 Documentação Completa

### 🚀 APIs Criadas

#### 1. **POST** `/api/payments/pix`
Cria um novo pagamento PIX.

**Request Body:**
```json
{
  "userId": "user123",
  "email": "usuario@email.com",
  "amount": 4.50
}
```

**Response:**
```json
{
  "success": true,
  "payment_id": 123456789,
  "status": "pending",
  "qr_code": "00020101021243650016...",
  "qr_code_base64": "iVBORw0KGgoAAAANS...",
  "ticket_url": "https://www.mercadopago.com/...",
  "expiration_date": "2026-02-12T23:59:59.000Z"
}
```

---

#### 2. **POST** `/api/webhooks/mercadopago`
Recebe notificações do Mercado Pago quando o pagamento é aprovado.

**Automático**: Mercado Pago envia para esta URL quando o status muda.

**Comportamento:**
- Quando `status === "approved"` → Libera premium automaticamente
- Atualiza usuário no banco de dados (Map temporário, substituir por DB real)

---

#### 3. **GET** `/api/payments/status/:paymentId`
Consulta o status de um pagamento específico.

**Response:**
```json
{
  "success": true,
  "payment_id": 123456789,
  "status": "approved",
  "status_detail": "accredited",
  "transaction_amount": 4.50,
  "date_created": "2026-02-12T10:00:00Z",
  "date_approved": "2026-02-12T10:02:00Z",
  "user_data": {
    "userId": "user123",
    "premium": true,
    "premiumSince": "2026-02-12T10:02:00Z"
  }
}
```

---

#### 4. **GET** `/api/payments/check-premium/:userId`
Verifica se um usuário é premium.

**Response:**
```json
{
  "success": true,
  "userId": "user123",
  "isPremium": true,
  "data": {
    "paymentId": "123456789",
    "premiumSince": "2026-02-12T10:02:00Z",
    "email": "usuario@email.com"
  }
}
```

---

### 🔧 Configuração

#### 1. Instalar Dependência
```bash
npm install mercadopago
```

#### 2. Variáveis de Ambiente
Adicione no arquivo `.env`:

```env
MP_ACCESS_TOKEN=seu_access_token_aqui
PUBLIC_URL=https://metafy.vercel.app
```

**Como obter o Access Token:**
1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Crie um aplicativo ou use existente
3. Copie o **Access Token** (Production ou Test)

---

### 📝 Fluxo Completo

```
1. Frontend chama POST /api/payments/pix
   └─> Recebe QR Code PIX

2. Usuário escaneia QR Code e paga
   └─> Mercado Pago processa

3. Mercado Pago envia webhook POST /api/webhooks/mercadopago
   └─> Backend consulta status
   └─> Se "approved" → Libera premium

4. Frontend pode consultar GET /api/payments/status/:paymentId
   └─> Verifica se pagamento foi aprovado

5. Ou consulta GET /api/payments/check-premium/:userId
   └─> Verifica se usuário já é premium
```

---

### 🔒 Segurança

- ✅ Webhook responde 200 imediatamente (requisito do Mercado Pago)
- ✅ Consulta API do MP para validar dados (não confia apenas no webhook)
- ✅ RAW body parser apenas para rota do webhook
- ✅ Logs detalhados de todas as operações

---

### 🗄️ Banco de Dados

**IMPORTANTE:** O código usa `Map` temporário. Substitua por seu banco real:

```javascript
// Exemplo com MongoDB/Mongoose
await User.updateOne(
  { userId: userId },
  {
    premium: true,
    premiumSince: new Date(),
    premiumEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  }
);

// Exemplo com PostgreSQL
await db.query(
  'UPDATE users SET premium = true, premium_since = NOW() WHERE user_id = $1',
  [userId]
);
```

---

### 🧪 Testar

#### Modo Sandbox (Test)
Use `MP_ACCESS_TOKEN` de **TEST** no Mercado Pago.

#### Pagar com PIX de teste:
1. Acesse o `ticket_url` retornado
2. Use CPF de teste: `12345678909`
3. Pague e aguarde webhook

---

### 📦 Arquivos Modificados

- ✅ `payments.js` - Novo arquivo com todas as rotas
- ✅ `server.js` - Registra rotas de pagamento
- ✅ `.env.example` - Variáveis do Mercado Pago
- ✅ `package.json` - Dependência mercadopago adicionada

---

### 🚀 Deploy

```bash
git add .
git commit -m "feat: Sistema de pagamento PIX via Mercado Pago"
git push
```

Na Vercel, adicione as variáveis:
- `MP_ACCESS_TOKEN`
- `PUBLIC_URL=https://metafy.vercel.app`

---

### 📞 Suporte

Documentação oficial: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/landing
