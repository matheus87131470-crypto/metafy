/**
 * routes/payments.js
 * Pagamento PIX via Asaas
 */

import express from 'express';
import { setPremium, getUser } from '../../lib/userStore.js';

const router = express.Router();

const PREMIUM_PRICE = 4.50; // R$ 4,50
const PREMIUM_DAYS = 7;

const ASAAS_BASE_URL =
  process.env.ASAAS_ENV === 'production'
    ? 'https://api.asaas.com'
    : 'https://sandbox.asaas.com';

const ASAAS_KEY = process.env.ASAAS_API_KEY || '';

if (ASAAS_KEY) {
  console.log(`✅ Asaas configurado (${process.env.ASAAS_ENV === 'production' ? 'produção' : 'sandbox'})`);
} else {
  console.warn('⚠️ ASAAS_API_KEY não configurado – pagamentos PIX desabilitados');
}

/**
 * Wrapper para chamadas na API Asaas
 */
async function asaas(method, path, body = null) {
  const url = `${ASAAS_BASE_URL}/api/v3${path}`;

  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_KEY,
      'User-Agent': 'metafy-backend/1.0'
    }
  };

  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const data = await res.json();

  if (!res.ok) {
    const msg = data?.errors?.[0]?.description || JSON.stringify(data);
    throw new Error(`Asaas [${res.status}]: ${msg}`);
  }

  return data;
}

/* ─────────────────────────────────────────────────────────
   POST /api/payments/pix
   Cria cobrança PIX → retorna { qrCodeImage, pixCopiaECola, txid, expiresAt }
───────────────────────────────────────────────────────── */
router.post('/pix', async (req, res) => {
  try {
    const { userId, cpf, name } = req.body;

    if (!userId || !cpf) {
      return res.status(400).json({ success: false, error: 'userId e CPF são obrigatórios' });
    }

    if (!ASAAS_KEY) {
      return res.status(503).json({ success: false, error: 'Pagamento temporariamente indisponível' });
    }

    const cpfNumerico = cpf.replace(/\D/g, '');
    if (cpfNumerico.length !== 11) {
      return res.status(400).json({ success: false, error: 'CPF inválido – deve ter 11 dígitos' });
    }

    // Verificar se usuário existe no sistema
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }

    // ── 1. Buscar ou criar cliente no Asaas ──────────────────────
    let customerId;
    try {
      const searchRes = await asaas('GET', `/customers?cpfCnpj=${cpfNumerico}&limit=1`);
      if (searchRes.data?.length > 0) {
        customerId = searchRes.data[0].id;
        console.log(`↩️  Cliente Asaas reutilizado: ${customerId}`);
      }
    } catch (e) {
      console.warn('⚠️ Falha ao buscar cliente:', e.message);
    }

    if (!customerId) {
      const customer = await asaas('POST', '/customers', {
        name: name || `usuario_${userId.slice(-6)}`,
        cpfCnpj: cpfNumerico,
        externalReference: userId
      });
      customerId = customer.id;
      console.log(` Cliente criado no Asaas: ${customerId}`);
    }

    //  2. Criar cobrança PIX 
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateStr = dueDate.toISOString().split('T')[0]; // YYYY-MM-DD

    const charge = await asaas('POST', '/payments', {
      customer: customerId,
      billingType: 'PIX',
      value: PREMIUM_PRICE,
      dueDate: dueDateStr,
      description: 'Metafy Premium  7 dias',
      externalReference: userId
    });

    console.log(` Cobrança PIX criada: ${charge.id} (userId: ${userId})`);

    //  3. Buscar QR Code 
    const qrData = await asaas('GET', `/payments/${charge.id}/pixQrCode`);

    return res.json({
      success: true,
      txid: charge.id,
      qrCodeImage: `data:image/png;base64,${qrData.encodedImage}`,
      pixCopiaECola: qrData.payload,
      expiresAt: charge.dueDate
    });

  } catch (error) {
    console.error(' Erro ao criar PIX:', error.message);
    return res.status(500).json({ success: false, error: 'Erro ao gerar cobrança PIX: ' + error.message });
  }
});

/* 
   GET /api/payments/pix/status/:chargeId?userId=xxx
   Polling de status para o frontend
 */
router.get('/pix/status/:chargeId', async (req, res) => {
  try {
    const { chargeId } = req.params;
    const { userId } = req.query;

    if (!chargeId || !userId) {
      return res.status(400).json({ success: false, error: 'chargeId e userId são obrigatórios' });
    }

    if (!ASAAS_KEY) {
      return res.status(503).json({ success: false, error: 'Serviço indisponível' });
    }

    const charge = await asaas('GET', `/payments/${chargeId}`);
    const isPaid = charge.status === 'RECEIVED' || charge.status === 'CONFIRMED';

    // Se pago e referência bate, ativar premium
    if (isPaid && charge.externalReference === userId) {
      const user = await getUser(userId);
      const now = new Date();
      const alreadyPremium = user.premiumUntil && new Date(user.premiumUntil) > now;

      if (!alreadyPremium) {
        await setPremium(userId, {
          paymentId: chargeId,
          amount: charge.value,
          approvedAt: now.toISOString(),
          paymentMethod: 'PIX',
          provider: 'asaas'
        });
        console.log(` Premium ativado via polling: ${userId}`);
      }
    }

    return res.json({ success: true, status: charge.status, isPaid });

  } catch (error) {
    console.error(' Erro ao verificar status PIX:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/* 
   POST /api/payments/simulate-approval   [SOMENTE TESTES]
 */
router.post('/simulate-approval', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId é obrigatório' });
    }

    const ok = await setPremium(userId, {
      paymentId: `sim_${Date.now()}`,
      amount: PREMIUM_PRICE,
      approvedAt: new Date().toISOString(),
      isSimulation: true
    });

    return res.json({
      success: ok,
      message: ok
        ? ` Premium simulado para ${userId} por ${PREMIUM_DAYS} dias`
        : ' Erro ao simular premium'
    });

  } catch (error) {
    console.error(' Erro ao simular aprovação:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
